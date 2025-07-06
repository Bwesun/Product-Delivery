const express = require("express");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Get all users (admin only)
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search, isActive } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID (admin only)
router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user (admin only)
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role, phone, address, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Deactivate/Activate user (admin only)
router.put("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last admin user" });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dispatchers list (for assigning deliveries)
router.get("/role/dispatchers", auth, adminOnly, async (req, res) => {
  try {
    const dispatchers = await User.find({
      role: "dispatcher",
      isActive: true,
    }).select("name email phone");

    res.json(dispatchers);
  } catch (error) {
    console.error("Get dispatchers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user statistics by role
router.get("/stats/role-distribution", auth, adminOnly, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    });

    res.json({
      roleDistribution: stats,
      totalUsers,
      newUsersThisMonth,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
