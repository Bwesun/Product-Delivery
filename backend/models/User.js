import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "dispatcher", "admin"],
      default: "user",
    },
    phone: { type: String },
    address: { type: String },
    avatar: {
      type: String,
      default: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
