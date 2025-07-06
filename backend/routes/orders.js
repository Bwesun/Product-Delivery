const express = require("express");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = { customer: req.user._id };

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

    const orders = await Order.find(query)
      .populate("assignedDelivery")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new order
router.post("/", auth, authorize("user", "admin"), async (req, res) => {
  try {
    const {
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      priority = "Medium",
      requestedDeliveryDate,
      specialInstructions,
    } = req.body;

    const order = new Order({
      customer: req.user._id,
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      priority,
      requestedDeliveryDate,
      specialInstructions,
    });

    await order.save();

    // Automatically create a delivery entry
    const delivery = new Delivery({
      orderId: order._id,
      customer: req.user._id,
      dispatcher: null, // Will be assigned later by admin
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      priority,
    });

    await delivery.save();

    // Link delivery to order
    order.assignedDelivery = delivery._id;
    await order.save();

    // Emit real-time notification to admins
    req.io.to("admin-room").emit("new-order", {
      orderId: order._id,
      customerName: req.user.name,
      product,
      priority,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
      delivery,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("assignedDelivery");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only see their own orders (unless admin)
    if (
      req.user.role !== "admin" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order (before it's assigned to delivery)
router.put("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only edit their own orders (unless admin)
    if (
      req.user.role !== "admin" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Can't edit if already in progress
    if (["In Transit", "Delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot edit order that is already in progress" });
    }

    const allowedUpdates = [
      "product",
      "pickupAddress",
      "pickupPhone",
      "deliveryAddress",
      "deliveryPhone",
      "details",
      "specialInstructions",
      "requestedDeliveryDate",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    await order.save();

    // Also update the associated delivery
    if (order.assignedDelivery) {
      const delivery = await Delivery.findById(order.assignedDelivery);
      if (delivery) {
        allowedUpdates.forEach((field) => {
          if (req.body[field] !== undefined && delivery[field] !== undefined) {
            delivery[field] = req.body[field];
          }
        });
        await delivery.save();
      }
    }

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel order
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only cancel their own orders (unless admin)
    if (
      req.user.role !== "admin" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Can't cancel if already delivered
    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    order.status = "Cancelled";
    await order.save();

    // Also update the associated delivery
    if (order.assignedDelivery) {
      const delivery = await Delivery.findById(order.assignedDelivery);
      if (delivery) {
        delivery.status = "Cancelled";
        delivery.statusHistory.push({
          status: "Cancelled",
          notes: "Order cancelled by customer",
          updatedBy: req.user._id,
          timestamp: new Date(),
        });
        await delivery.save();
      }
    }

    // Emit real-time notification
    req.io.to("admin-room").emit("order-cancelled", {
      orderId: order._id,
      customerName: req.user.name,
    });

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get order tracking information
router.get("/:id/tracking", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "assignedDelivery",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only track their own orders (unless admin)
    if (
      req.user.role !== "admin" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!order.assignedDelivery) {
      return res.json({
        trackingNumber: null,
        status: order.status,
        statusHistory: [],
        estimatedDeliveryTime: null,
      });
    }

    const delivery = await Delivery.findById(order.assignedDelivery).populate(
      "dispatcher",
      "name phone",
    );

    res.json({
      trackingNumber: delivery.trackingNumber,
      status: delivery.status,
      statusHistory: delivery.statusHistory,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
      dispatcher: delivery.dispatcher,
    });
  } catch (error) {
    console.error("Get tracking error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's order statistics
router.get(
  "/stats/dashboard",
  auth,
  authorize("user", "admin"),
  async (req, res) => {
    try {
      const query = { customer: req.user._id };

      const stats = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const totalOrders = await Order.countDocuments(query);
      const thisMonthOrders = await Order.countDocuments({
        ...query,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      });

      const recentOrders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        stats,
        totalOrders,
        thisMonthOrders,
        recentOrders,
      });
    } catch (error) {
      console.error("Get order stats error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
