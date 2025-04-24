import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './mails/email.routes.js';
import paypalRoutes from './routes/paypal.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());


app.options('*', cors()); // Enable pre-flight requests for all routes
app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
app.use("/paypal", paypalRoutes);
app.use('/api/invoice', invoiceRoutes);

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