import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    date: { type: String, required: true },
    details: { type: String },
    pickupAddress: { type: String, required: true },
    pickupPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    trackingNumber: { type: String, unique: true },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
  },
  { timestamps: true },
);

// Generate tracking number before saving
deliverySchema.pre("save", function (next) {
  if (!this.trackingNumber) {
    this.trackingNumber =
      "DLV" +
      Date.now() +
      Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
