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

// ✅ MongoDB Connection (Serverless Safe)
let isDBConnected = false;
async function ensureDBConnection() {
  if (!isDBConnected) {
    await connectDB();
    isDBConnected = true;
    console.log("✅ MongoDB Connected (Serverless)");
  }
}

// ✅ Routes (wrap in middleware so DB always ready)
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    res.status(500).json({ message: "Database connection error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", ContactSendEmail);
app.post("/api/chat", chatController);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend API is running successfully on Vercel!");
});

// ✅ Export app for Vercel
export default app;
