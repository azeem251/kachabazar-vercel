import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
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

// ✅ Always connect MongoDB once (Vercel-safe)
let isDBConnected = false;
async function ensureDBConnection() {
  if (!isDBConnected) {
    await connectDB();
    isDBConnected = true;
    console.log("✅ MongoDB Connected (Serverless)");
  }
}
await ensureDBConnection();

// ✅ Allowed Origins
const allowedOrigins = [
  "https://kachabazar-frontend-ebon.vercel.app",
  "http://localhost:5173",
];

// ✅ CORS setup (keep it at very top before routes)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin"));
      }
    },
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", ContactSendEmail);
app.post("/api/chat", chatController);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running successfully on Vercel!");
});

// ✅ Global error handler (for debugging CORS / crashes)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ message: err.message });
});

// ✅ Export for Vercel serverless function
export default app;
