import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './mails/email.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173", // Dev
  "https://proforma-gen.vercel.app", // Prod
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
app.use("/paypal", paypalRoutes);

// Connect to database first, then start server
const startServer = async () => {
  try {
    await connectDB();
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