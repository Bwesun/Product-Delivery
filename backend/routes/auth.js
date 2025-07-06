import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Create or update user profile
router.post("/profile", async (req, res) => {
  try {
    const {
      uid,
      name,
      email,
      role = "user",
      phone,
      address,
      avatar,
    } = req.body;

    let user = await User.findOne({ uid });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.avatar = avatar || user.avatar;
      if (role) user.role = role;
      await user.save();
    } else {
      // Create new user
      user = new User({ uid, name, email, role, phone, address, avatar });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get("/profile/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile/:uid", async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findOne({ uid: req.params.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
