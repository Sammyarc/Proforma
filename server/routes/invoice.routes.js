import express from "express";
import Invoice from "../models/invoice.model.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();


router.get("/invoices", async (req, res) => {
    try {
      const { userId, status, page = 1, limit = 10, sortBy = 'invoiceDate', sortOrder = -1 } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
  
      const query = { userId };
      
      // Add status filter if provided
      if (status) query.status = status;
  
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Set up sorting
      const sort = {};
      sort[sortBy] = parseInt(sortOrder);
  
      // Fetch invoices with pagination
      const invoices = await Invoice.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await Invoice.countDocuments(query);
      
      res.status(200).json({
        invoices,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({
        error: "Failed to fetch invoices",
        details: error.message
      });
    }
});

//
router.get("/invoices/overview", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
  
      // Get total count of invoices
      const totalInvoices = await Invoice.countDocuments({ userId });
  
      // Get total amount of all invoices
      const totalAmount = await Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amountNumeric" } } }
      ]);
  
      res.status(200).json({
        totalInvoices,
        totalAmount: totalAmount[0] ? totalAmount[0].total : 0
      });
    } catch (error) {
      console.error("Error fetching invoice overview:", error);
      res.status(500).json({
        error: "Failed to fetch invoice overview",
        details: error.message
      });
    }
});

// Get invoice statistics by client
// This endpoint will return the number of invoices per client
router.get("/invoices/clients", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user authentication middleware
        
        // Use MongoDB aggregation to get the statistics
        const clientStats = await Invoice.aggregate([
          // Match documents for the current user
          { $match: { userId: userId } },
          
          // Group by clientName
          { $group: {
              _id: {
                clientName: "$clientName",
                clientAddress: "$clientAddress"
              },
              invoiceCount: { $sum: 1 }
            }
          },
          
          // Format the output
          { $project: {
              _id: 0,
              clientName: "$_id.clientName",
              clientAddress: "$_id.clientAddress",
              invoiceCount: 1
            }
          },
          
          // Sort by clientName
          { $sort: { clientName: 1 } }
        ]);
        
        // Calculate total number of unique clients
        const totalClients = clientStats.length;
        
        res.status(200).json({
          success: true,
          totalClients,
          clients: clientStats
        });
        
      } catch (error) {
        console.error('Error getting client statistics:', error);
        res.status(500).json({
          success: false,
          message: 'Error retrieving client statistics',
          error: error.message
        });
      }
 });
  

// Get invoice by ID
router.get("/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required for security validation" });
      }
      
      const invoice = await Invoice.findOne({ _id: id, userId });
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.status(200).json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({
        error: "Failed to fetch invoice",
        details: error.message
      });
    }
});
  
// Update invoice status (e.g., when payment is completed)
router.patch("/invoices/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, userId } = req.body;
      
      if (!userId || !status) {
        return res.status(400).json({ error: "userId and status are required" });
      }
      
      const validStatuses = ['pending', 'paid', 'overdue'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const invoice = await Invoice.findOneAndUpdate(
        { _id: id, userId }, 
        { status }, 
        { new: true }
      );
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.status(200).json(invoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({
        error: "Failed to update invoice status",
        details: error.message
      });
    }
});
  
// Get invoice statistics for dashboard
router.get("/invoices/stats/summary", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      
      // Get count by status
      const statusCounts = await Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);
      
      // Sum of amounts by status
      const amountByStatus = await Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", total: { $sum: "$amountNumeric" } } }
      ]);
      
      // Recent activity (last 30 days)
      const recentActivity = await Invoice.aggregate([
        { $match: { userId, sentDate: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amountNumeric" } } }
      ]);
      
      res.status(200).json({
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        amountByStatus: amountByStatus.reduce((acc, item) => {
          acc[item._id] = item.total;
          return acc;
        }, {}),
        recentActivity: recentActivity.reduce((acc, item) => {
          acc[item._id] = { count: item.count, total: item.total };
          return acc;
        }, {}),
      });
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      res.status(500).json({
        error: "Failed to fetch invoice statistics",
        details: error.message
      });
    }
});
  
// Delete invoice
router.delete("/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      const invoice = await Invoice.findOneAndDelete({ _id: id, userId });
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({
        error: "Failed to delete invoice",
        details: error.message
      });
    }
});

// Export the router
export default router;