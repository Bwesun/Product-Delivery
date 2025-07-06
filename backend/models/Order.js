const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Ready for Pickup",
        "In Transit",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    pickupPhone: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryPhone: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    assignedDelivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    requestedDeliveryDate: {
      type: Date,
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
