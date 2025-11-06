// import Order from "../models/Order.js";

// export const confirmOrder = async (req, res) => {
//   const { items, user, paymentMethod, total } = req.body;
//   const order = await Order.create({ items, user, paymentMethod, total });
//   res.status(201).json(order);
// };


import Order from "../models/Order.js";
import User from "../models/User.js";

// controllers/orderController.js
export const confirmOrder = async (req, res) => {
  try {
    
    const { items, total, paymentMethod, shippingAddress } = req.body;
    const userId = req.user?._id;

     if (!items || !total || !shippingAddress || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order({
      user: userId,
      items,
      total,
      paymentMethod,
      shippingAddress
    });

    const savedOrder = await order.save();
  
    res.status(201).json({ message: "Order placed", order: savedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};




export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: Verify if the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to get order", error: err.message });
  }
};

