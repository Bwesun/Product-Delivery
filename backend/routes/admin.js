import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";

const router = express.Router();

// Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalDeliveries = await Delivery.countDocuments();

    // Today's stats
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(today) },
    });
    const todayDeliveries = await Delivery.countDocuments({
      date: today,
    });

    // Status distribution
    const orderStatuses = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const deliveryStatuses = await Delivery.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // User roles
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Recent activities
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("product status createdAt customerId");

    const recentDeliveries = await Delivery.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("product status updatedAt customerId dispatcherId");

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalOrders,
          totalDeliveries,
          todayOrders,
          todayDeliveries,
        },
        statusDistribution: {
          orders: orderStatuses,
          deliveries: deliveryStatuses,
        },
        userRoles,
        recentActivities: {
          orders: recentOrders,
          deliveries: recentDeliveries,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const { role, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
router.put("/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    Object.assign(user, req.body);
    await user.save();

    res.json({ success: true, user, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete("/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot delete the last admin" });
      }
    }

    await User.deleteOne({ uid: req.params.uid });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dispatchers list
router.get("/dispatchers", async (req, res) => {
  try {
    const dispatchers = await User.find({
      role: "dispatcher",
      isActive: true,
    }).select("uid name email phone");

    res.json({ success: true, dispatchers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics data
router.get("/analytics", async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    let startDate = new Date();
    switch (period) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Orders over time
    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Deliveries over time
    const deliveriesOverTime = await Delivery.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        ordersOverTime,
        deliveriesOverTime,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
