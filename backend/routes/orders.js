import express from "express";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";

const router = express.Router();

// Get user's orders
router.get("/:uid", async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { customerId: req.params.uid };

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

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post("/", async (req, res) => {
  try {
    const {
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      customerId,
      priority = "Medium",
    } = req.body;

    // Create order
    const order = new Order({
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      customerId,
      priority,
    });

    await order.save();

    // Auto-create delivery
    const delivery = new Delivery({
      product,
      pickupAddress,
      pickupPhone,
      deliveryAddress,
      deliveryPhone,
      details,
      customerId,
      priority,
      date: new Date().toISOString().split("T")[0],
    });

    await delivery.save();

    // Link delivery to order
    order.deliveryId = delivery._id;
    await order.save();

    res.json({ success: true, order, delivery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Can't edit if already in transit or delivered
    if (["In Transit", "Delivered"].includes(order.status)) {
      return res.status(400).json({ error: "Cannot edit order in progress" });
    }

    Object.assign(order, req.body);
    await order.save();

    // Also update linked delivery
    if (order.deliveryId) {
      const delivery = await Delivery.findById(order.deliveryId);
      if (delivery) {
        Object.assign(delivery, req.body);
        await delivery.save();
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ error: "Cannot cancel delivered order" });
    }

    order.status = "Cancelled";
    await order.save();

    // Also cancel linked delivery
    if (order.deliveryId) {
      const delivery = await Delivery.findById(order.deliveryId);
      if (delivery) {
        delivery.status = "Cancelled";
        await delivery.save();
      }
    }

    res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order tracking
router.get("/tracking/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    let delivery = null;
    if (order.deliveryId) {
      delivery = await Delivery.findById(order.deliveryId);
    }

    res.json({
      success: true,
      order,
      delivery,
      trackingNumber: delivery?.trackingNumber,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
