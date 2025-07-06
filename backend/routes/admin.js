const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Get dashboard statistics
router.get("/dashboard/stats", auth, adminOnly, async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay()),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalDeliveries = await Delivery.countDocuments();

    // Today's statistics
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$estimatedCost" },
        },
      },
    ]);

    // Weekly statistics
    const weeklyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    const weeklyDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    // Monthly statistics
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    const monthlyDeliveries = await Delivery.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Delivery status distribution
    const deliveryStatusStats = await Delivery.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // User role distribution
    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top performing dispatchers
    const topDispatchers = await Delivery.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: "$dispatcher",
          deliveredCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "dispatcher",
        },
      },
      {
        $unwind: "$dispatcher",
      },
      {
        $sort: { deliveredCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          name: "$dispatcher.name",
          email: "$dispatcher.email",
          deliveredCount: 1,
        },
      },
    ]);

    res.json({
      overview: {
        totalUsers,
        totalOrders,
        totalDeliveries,
        todayOrders,
        todayDeliveries,
        todayRevenue: todayRevenue[0]?.total || 0,
        weeklyOrders,
        weeklyDeliveries,
        monthlyOrders,
        monthlyDeliveries,
      },
      statusDistribution: {
        orders: orderStatusStats,
        deliveries: deliveryStatusStats,
      },
      userRoleDistribution: userRoleStats,
      topDispatchers,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics data for charts
router.get("/analytics/charts", auth, adminOnly, async (req, res) => {
  try {
    const { period = "7d" } = req.query;

    let startDate;
    let groupBy;

    switch (period) {
      case "24h":
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%H:00", date: "$createdAt" },
        };
        break;
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "1y":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        groupBy = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    // Orders over time
    const ordersOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Deliveries over time
    const deliveriesOverTime = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Revenue over time
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$estimatedCost" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Delivery status trends
    const statusTrends = await Delivery.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: groupBy,
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    res.json({
      ordersOverTime,
      deliveriesOverTime,
      revenueOverTime,
      statusTrends,
    });
  } catch (error) {
    console.error("Get analytics charts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get recent activities
router.get("/activities/recent", auth, adminOnly, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Recent orders
    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .select("product status createdAt customer");

    // Recent delivery updates
    const recentDeliveries = await Delivery.find()
      .populate("customer", "name email")
      .populate("dispatcher", "name email")
      .sort({ updatedAt: -1 })
      .limit(limit / 2)
      .select("product status updatedAt customer dispatcher trackingNumber");

    // Combine and sort activities
    const activities = [
      ...recentOrders.map((order) => ({
        type: "order",
        id: order._id,
        title: `New order: ${order.product}`,
        description: `Order placed by ${order.customer.name}`,
        status: order.status,
        timestamp: order.createdAt,
        user: order.customer,
      })),
      ...recentDeliveries.map((delivery) => ({
        type: "delivery",
        id: delivery._id,
        title: `Delivery update: ${delivery.product}`,
        description: `Status changed to ${delivery.status}`,
        status: delivery.status,
        timestamp: delivery.updatedAt,
        user: delivery.customer,
        dispatcher: delivery.dispatcher,
        trackingNumber: delivery.trackingNumber,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error("Get recent activities error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get performance metrics
router.get("/performance/metrics", auth, adminOnly, async (req, res) => {
  try {
    // Average delivery time
    const avgDeliveryTime = await Delivery.aggregate([
      {
        $match: {
          status: "Delivered",
          actualDeliveryTime: { $exists: true },
        },
      },
      {
        $project: {
          deliveryDuration: {
            $subtract: ["$actualDeliveryTime", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$deliveryDuration" },
        },
      },
    ]);

    // Success rate (delivered vs total)
    const totalDeliveries = await Delivery.countDocuments();
    const deliveredCount = await Delivery.countDocuments({
      status: "Delivered",
    });
    const successRate =
      totalDeliveries > 0 ? (deliveredCount / totalDeliveries) * 100 : 0;

    // Customer satisfaction (placeholder - would need ratings system)
    const customerSatisfaction = 4.2; // Mock value

    // On-time delivery rate
    const onTimeDeliveries = await Delivery.countDocuments({
      status: "Delivered",
      actualDeliveryTime: { $lte: "$estimatedDeliveryTime" },
    });
    const onTimeRate =
      deliveredCount > 0 ? (onTimeDeliveries / deliveredCount) * 100 : 0;

    // Dispatcher performance
    const dispatcherPerformance = await Delivery.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: "$dispatcher",
          deliveries: { $sum: 1 },
          avgDeliveryTime: {
            $avg: {
              $subtract: ["$actualDeliveryTime", "$createdAt"],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "dispatcher",
        },
      },
      {
        $unwind: "$dispatcher",
      },
      {
        $sort: { deliveries: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.json({
      avgDeliveryTime: avgDeliveryTime[0]?.avgDuration || 0,
      successRate,
      customerSatisfaction,
      onTimeRate,
      dispatcherPerformance,
    });
  } catch (error) {
    console.error("Get performance metrics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Emergency alerts and notifications
router.get("/alerts", auth, adminOnly, async (req, res) => {
  try {
    // Overdue deliveries
    const overdueDeliveries = await Delivery.find({
      status: { $in: ["Pending", "Assigned", "Picked Up", "In Transit"] },
      estimatedDeliveryTime: { $lt: new Date() },
    })
      .populate("customer", "name email")
      .populate("dispatcher", "name email");

    // High priority pending orders
    const highPriorityOrders = await Order.find({
      priority: { $in: ["High", "Urgent"] },
      status: "Pending",
    }).populate("customer", "name email");

    // Inactive dispatchers (no activity in 24 hours)
    const inactiveDispatchers = await User.find({
      role: "dispatcher",
      isActive: true,
      lastLogin: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // System health alerts (mock data)
    const systemAlerts = [
      {
        type: "performance",
        message: "Server response time elevated",
        severity: "warning",
        timestamp: new Date(),
      },
    ];

    res.json({
      overdueDeliveries: overdueDeliveries.length,
      highPriorityOrders: highPriorityOrders.length,
      inactiveDispatchers: inactiveDispatchers.length,
      alerts: [
        ...overdueDeliveries.map((d) => ({
          type: "delivery",
          message: `Overdue delivery: ${d.product}`,
          severity: "high",
          timestamp: d.estimatedDeliveryTime,
          data: d,
        })),
        ...highPriorityOrders.map((o) => ({
          type: "order",
          message: `High priority order pending: ${o.product}`,
          severity: "medium",
          timestamp: o.createdAt,
          data: o,
        })),
        ...systemAlerts,
      ],
    });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
