import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './mails/email.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import paymentEventsRoutes from './routes/paymentEvents.routes.js';
import Checkout from './models/checkout.model.js';
import draftsRoutes from './routes/drafts.routes.js';
import Attachment from './models/attachment.model.js';
import Client from './models/client.model.js';
import clientsRoutes from './routes/clients.routes.js';
import upgradeRoutes from './routes/upgrade.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import "./cronJobs/deleteOldUsers.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173", // Dev
  "https://proforma-gen.vercel.app", // Prod
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ service: 'proforma-api', status: 'ok' });
});



app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
app.use("/api", draftsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/paypal", paypalRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use("/settings", settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments', paymentEventsRoutes);
app.use('/upgrade', upgradeRoutes)

// Connect to database first, then start server
const startServer = async () => {
  try {
    await connectDB();
    // Uniqueness is part of replay protection, not an optional optimization.
    await Checkout.createIndexes();
    await Attachment.createIndexes();
    await Client.createIndexes();
    console.log("Database connected successfully");
    
    app.listen(PORT, () => {
      console.log("Server listening on port:", PORT);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
