import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectedDB from "./config/db.js";
import passport from "passport";
import './config/passport.js'
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes.js';
import session from 'express-session';
import path from 'path';

import productRoutes from './routes/productRoutes.js';
import { ContactSendEmail } from "./controllers/ContactSendEmail.js";
import chatRoutes from './routes/chatRoutes.js'
import { chatController } from "./controllers/chatController.js";
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from "./routes/orderRoutes.js"
dotenv.config();
const app = express();


// Middleware
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Allowed origins - dono localhost aur IP address add karo
const allowedOrigins = [
  'https://kachabazar-ui.onrender.com',
  "http://localhost:5173"
 
];


// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // origin might be undefined in some requests like Postman, so allow those
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // agar cookies ya authorization headers bhejna hai to
};
app.use(cors(corsOptions));
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    if(allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin.'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'secretKey123',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));
console.log("CLIENT_URL:", process.env.CLIENT_URL)


app.use(passport.initialize());
app.use(passport.session());



// all routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact',ContactSendEmail)

app.post('/api/chat', chatController);
app.use('/api/cart', cartRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);
// Routes (abhi ke liye default hello)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Connect to MongoDB first, then start the server
const PORT = process.env.PORT || 4747;

const startServer = async () => {
  try {
    await connectedDB(); // wait until MongoDB is connected
    app.listen(PORT,'0.0.0.0', () => {
      // console.log(`Server is running on port  http://192.168.1.34:${PORT} 🚀`);
      console.log(`Server is running on port  http://localhost:${PORT} 🚀`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
