const express = require("express");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const User = require("../models/User");
const { auth, dispatcherOnly } = require("../middleware/auth");

const router = express.Router();

// Get all deliveries (dispatchers only)
router.get("/", auth, dispatcherOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};

    // If not admin, only show deliveries assigned to this dispatcher
    if (req.user.role !== "admin") {
      query.dispatcher = req.user._id;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { product: { $regex: search, $options: "i" } },
        { pickupAddress: { $regex: search, $options: "i" } },
        { deliveryAddress: { $regex: search, $options: "i" } },
      ];
    }

    const deliveries = await Delivery.find(query)
      .populate("customer", "name email phone")
      .populate("dispatcher", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.json({
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get deliveries error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get delivery by ID
router.get("/:id", auth, dispatcherOnly, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("dispatcher", "name email phone")
      .populate("orderId");

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // If not admin, only allow access to own deliveries
    if (
      req.user.role !== "admin" &&
      delivery.dispatcher._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(delivery);
  } catch (error) {
    console.error("Get delivery error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update delivery status
router.put("/:id/status", auth, dispatcherOnly, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    // If not admin, only allow access to own deliveries
    if (
      req.user.role !== "admin" &&
      delivery.dispatcher.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const oldStatus = delivery.status;
    delivery.status = status;

    // Add to status history
    delivery.statusHistory.push({
      status,
      notes,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    // Set delivery time if delivered
    if (status === "Delivered") {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    // Update related order status
    if (delivery.orderId) {
      const order = await Order.findById(delivery.orderId);
      if (order) {
        order.status = status;
        await order.save();
      }
    }

    // Emit real-time update
    req.io.to("admin-room").emit("delivery-updated", {
      deliveryId: delivery._id,
      status,
      oldStatus,
      updatedBy: req.user.name,
    });

    res.json({
      message: "Delivery status updated successfully",
      delivery,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign delivery to dispatcher (admin only)
router.put("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { dispatcherId } = req.body;

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const dispatcher = await User.findById(dispatcherId);
    if (!dispatcher || dispatcher.role !== "dispatcher") {
      return res.status(400).json({ message: "Invalid dispatcher" });
    }

    delivery.dispatcher = dispatcherId;
    delivery.status = "Assigned";
    delivery.statusHistory.push({
      status: "Assigned",
      notes: `Assigned to ${dispatcher.name}`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await delivery.save();

    // Emit real-time update
    req.io.to("dispatcher-room").emit("delivery-assigned", {
      deliveryId: delivery._id,
      dispatcherId,
      dispatcherName: dispatcher.name,
    });

    res.json({
      message: "Delivery assigned successfully",
      delivery,
    });
  } catch (error) {
    console.error("Assign delivery error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get delivery statistics for dispatcher
router.get("/stats/dashboard", auth, dispatcherOnly, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { dispatcher: req.user._id };

    const stats = await Delivery.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalDeliveries = await Delivery.countDocuments(query);
    const todayDeliveries = await Delivery.countDocuments({
      ...query,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    const recentDeliveries = await Delivery.find(query)
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats,
      totalDeliveries,
      todayDeliveries,
      recentDeliveries,
    });
  } catch (error) {
    console.error("Get delivery stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
