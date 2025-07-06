const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/delivery_app",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    const users = [
      {
        name: "Admin User",
        email: "admin@delivery.com",
        password: "admin123",
        role: "admin",
        phone: "+1234567890",
        address: "123 Admin Street, Admin City",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        name: "John Dispatcher",
        email: "dispatcher@delivery.com",
        password: "dispatcher123",
        role: "dispatcher",
        phone: "+1234567891",
        address: "456 Dispatch Avenue, Dispatch City",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      {
        name: "Jane User",
        email: "user@delivery.com",
        password: "user123",
        role: "user",
        phone: "+1234567892",
        address: "789 User Boulevard, User City",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      {
        name: "Mike Dispatcher",
        email: "mike@delivery.com",
        password: "mike123",
        role: "dispatcher",
        phone: "+1234567893",
        address: "321 Delivery Lane, Dispatch City",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      },
      {
        name: "Sarah Customer",
        email: "sarah@delivery.com",
        password: "sarah123",
        role: "user",
        phone: "+1234567894",
        address: "654 Customer Street, Customer City",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("Users seeded successfully");
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

const seedOrdersAndDeliveries = async (users) => {
  try {
    // Clear existing orders and deliveries
    await Order.deleteMany({});
    await Delivery.deleteMany({});

    const adminUser = users.find((u) => u.role === "admin");
    const dispatcher1 = users.find(
      (u) => u.role === "dispatcher" && u.name === "John Dispatcher",
    );
    const dispatcher2 = users.find(
      (u) => u.role === "dispatcher" && u.name === "Mike Dispatcher",
    );
    const user1 = users.find(
      (u) => u.role === "user" && u.name === "Jane User",
    );
    const user2 = users.find(
      (u) => u.role === "user" && u.name === "Sarah Customer",
    );

    const ordersData = [
      {
        customer: user1._id,
        product: "Bluetooth Speaker",
        status: "In Transit",
        pickupAddress: "123 Tech Store, Lagos",
        pickupPhone: "+2348012345678",
        deliveryAddress: "456 Customer Ave, Abuja",
        deliveryPhone: "+2348098765432",
        details: "Handle with care - fragile electronics",
        priority: "Medium",
        estimatedCost: 2500,
        dispatcher: dispatcher1._id,
      },
      {
        customer: user2._id,
        product: "Gaming Laptop",
        status: "Delivered",
        pickupAddress: "789 Electronics Plaza, Ikeja",
        pickupPhone: "+2348023456789",
        deliveryAddress: "321 University Rd, Ibadan",
        deliveryPhone: "+2348087654321",
        details: "Deliver before 2 PM",
        priority: "High",
        estimatedCost: 5000,
        dispatcher: dispatcher2._id,
      },
      {
        customer: user1._id,
        product: "Books Collection",
        status: "Pending",
        pickupAddress: "555 Bookstore Lane, Enugu",
        pickupPhone: "+2348034567890",
        deliveryAddress: "777 Library Street, Port Harcourt",
        deliveryPhone: "+2348076543210",
        details: "Educational materials",
        priority: "Low",
        estimatedCost: 1500,
        dispatcher: null,
      },
      {
        customer: user2._id,
        product: "Smartphone",
        status: "Processing",
        pickupAddress: "999 Phone Shop, Kano",
        pickupPhone: "+2348045678901",
        deliveryAddress: "111 Home Street, Kaduna",
        deliveryPhone: "+2348065432109",
        details: "New device with warranty",
        priority: "Medium",
        estimatedCost: 3000,
        dispatcher: dispatcher1._id,
      },
    ];

    for (const orderData of ordersData) {
      // Create order
      const order = new Order(orderData);
      await order.save();

      // Create corresponding delivery
      const delivery = new Delivery({
        orderId: order._id,
        customer: orderData.customer,
        dispatcher: orderData.dispatcher,
        product: orderData.product,
        status: orderData.status,
        pickupAddress: orderData.pickupAddress,
        pickupPhone: orderData.pickupPhone,
        deliveryAddress: orderData.deliveryAddress,
        deliveryPhone: orderData.deliveryPhone,
        details: orderData.details,
        priority: orderData.priority,
        cost: orderData.estimatedCost,
        estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        actualDeliveryTime:
          orderData.status === "Delivered" ? new Date() : null,
      });

      await delivery.save();

      // Link delivery to order
      order.assignedDelivery = delivery._id;
      await order.save();
    }

    console.log("Orders and deliveries seeded successfully");
  } catch (error) {
    console.error("Error seeding orders and deliveries:", error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Starting database seeding...");

    const users = await seedUsers();
    await seedOrdersAndDeliveries(users);

    console.log("Database seeding completed successfully!");
    console.log("\nTest accounts created:");
    console.log("Admin: admin@delivery.com / admin123");
    console.log("Dispatcher: dispatcher@delivery.com / dispatcher123");
    console.log("User: user@delivery.com / user123");

    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
