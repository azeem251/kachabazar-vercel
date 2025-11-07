import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";

import connectDB from "./config/db.js";
import "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { ContactSendEmail } from "./controllers/ContactSendEmail.js";
import { chatController } from "./controllers/chatController.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "https://kachabazar-ui.onrender.com",
  "http://localhost:5173",
];

// ✅ CORS Setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy does not allow access from this origin."));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "secretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection (Serverless Friendly)
let isDBConnected = false;
const connectIfNeeded = async () => {
  if (!isDBConnected) {
    await connectDB();
    isDBConnected = true;
  }
};
await connectIfNeeded();

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", ContactSendEmail);
app.post("/api/chat", chatController);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running successfully on Vercel!");
});

// ✅ Export (Vercel expects this)
export default app;
