import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './mails/email.routes.js';
import paypayRoutes from './routes/paypal.routes.js';
import cookieParser from 'cookie-parser';
import cors from "cors";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173", // Dev
  "", // Prod
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
app.use("/connect", paypayRoutes)


app.listen(PORT, () => {
    connectDB();
    console.log("listening on port: ", PORT);
});