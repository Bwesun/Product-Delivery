import express from "express";
import Delivery from "../models/Delivery.js";
import User from "../models/User.js";

const router = express.Router();

// Get all deliveries (for dispatchers)
router.get("/", async (req, res) => {
  try {
    const { status, search, dispatcherId } = req.query;
    const query = {};

    if (dispatcherId) {
      query.dispatcherId = dispatcherId;
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

    const deliveries = await Delivery.find(query).sort({ createdAt: -1 });

    // Get customer and dispatcher names
    const enrichedDeliveries = await Promise.all(
      deliveries.map(async (delivery) => {
        const customer = await User.findById(delivery.customerId);
        const dispatcher = delivery.dispatcherId
          ? await User.findById(delivery.dispatcherId)
          : null;

        return {
          ...delivery.toObject(),
          customerName: customer?.name || "Unknown",
          dispatcherName: dispatcher?.name || "Unassigned",
        };
      }),
    );

    res.json({ success: true, deliveries: enrichedDeliveries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update delivery status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    delivery.status = status;
    if (status === "Delivered") {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    res.json({
      success: true,
      delivery,
      message: "Status updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign delivery to dispatcher
router.put("/:id/assign", async (req, res) => {
  try {
    const { dispatcherId } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    const dispatcher = await User.findById(dispatcherId);
    if (!dispatcher || dispatcher.role !== "dispatcher") {
      return res.status(400).json({ error: "Invalid dispatcher" });
    }

    delivery.dispatcherId = dispatcherId;
    delivery.status = "Assigned";
    await delivery.save();

    res.json({
      success: true,
      delivery,
      message: "Delivery assigned successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery statistics
router.get("/stats", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let query = {};
    if (user.role === "dispatcher") {
      query.dispatcherId = req.user.userId;
    }

    const totalDeliveries = await Delivery.countDocuments(query);
    const pendingDeliveries = await Delivery.countDocuments({
      ...query,
      status: "Pending",
    });
    const inTransitDeliveries = await Delivery.countDocuments({
      ...query,
      status: "In Transit",
    });
    const deliveredCount = await Delivery.countDocuments({
      ...query,
      status: "Delivered",
    });

    // Today's deliveries
    const today = new Date().toISOString().split("T")[0];
    const todayDeliveries = await Delivery.countDocuments({
      ...query,
      date: today,
    });

    res.json({
      success: true,
      stats: {
        total: totalDeliveries,
        pending: pendingDeliveries,
        inTransit: inTransitDeliveries,
        delivered: deliveredCount,
        today: todayDeliveries,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
