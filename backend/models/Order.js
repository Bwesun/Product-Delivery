import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    pickupAddress: { type: String, required: true },
    pickupPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    details: { type: String },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    estimatedCost: { type: Number, default: 0 },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
