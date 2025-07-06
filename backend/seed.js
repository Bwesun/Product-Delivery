import mongoose from "mongoose";
import User from "./models/User.js";
import Order from "./models/Order.js";
import Delivery from "./models/Delivery.js";

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/delivery_app";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Delivery.deleteMany({});

    console.log("Cleared existing data");

    // Create users
    const users = await User.create([
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
        name: "Jane Customer",
        email: "user@delivery.com",
        password: "user123",
        role: "user",
        phone: "+1234567892",
        address: "789 Customer Boulevard, Customer City",
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
    ]);

    console.log("Created users:", users.length);

    // Find users for creating orders
    const admin = users.find((u) => u.role === "admin");
    const dispatcher1 = users.find(
      (u) => u.role === "dispatcher" && u.name === "John Dispatcher",
    );
    const dispatcher2 = users.find(
      (u) => u.role === "dispatcher" && u.name === "Mike Dispatcher",
    );
    const customer1 = users.find(
      (u) => u.role === "user" && u.name === "Jane Customer",
    );
    const customer2 = users.find(
      (u) => u.role === "user" && u.name === "Sarah Customer",
    );

    // Create sample orders and deliveries
    const orderData = [
      {
        customer: customer1._id,
        product: "Bluetooth Speaker",
        status: "In Transit",
        pickupAddress: "123 Tech Store, Lagos",
        pickupPhone: "+2348012345678",
        deliveryAddress: "456 Customer Ave, Abuja",
        deliveryPhone: "+2348098765432",
        details: "Handle with care - fragile electronics",
        priority: "Medium",
        dispatcher: dispatcher1._id,
      },
      {
        customer: customer2._id,
        product: "Gaming Laptop",
        status: "Delivered",
        pickupAddress: "789 Electronics Plaza, Ikeja",
        pickupPhone: "+2348023456789",
        deliveryAddress: "321 University Rd, Ibadan",
        deliveryPhone: "+2348087654321",
        details: "Deliver before 2 PM",
        priority: "High",
        dispatcher: dispatcher2._id,
      },
      {
        customer: customer1._id,
        product: "Books Collection",
        status: "Pending",
        pickupAddress: "555 Bookstore Lane, Enugu",
        pickupPhone: "+2348034567890",
        deliveryAddress: "777 Library Street, Port Harcourt",
        deliveryPhone: "+2348076543210",
        details: "Educational materials",
        priority: "Low",
        dispatcher: null,
      },
      {
        customer: customer2._id,
        product: "Smartphone",
        status: "Confirmed",
        pickupAddress: "999 Phone Shop, Kano",
        pickupPhone: "+2348045678901",
        deliveryAddress: "111 Home Street, Kaduna",
        deliveryPhone: "+2348065432109",
        details: "New device with warranty",
        priority: "Medium",
        dispatcher: dispatcher1._id,
      },
      {
        customer: customer1._id,
        product: "Headphones",
        status: "Cancelled",
        pickupAddress: "222 Audio Store, Lagos",
        pickupPhone: "+2348056789012",
        deliveryAddress: "333 Music Ave, Lagos",
        deliveryPhone: "+2348054321098",
        details: "Customer changed mind",
        priority: "Low",
        dispatcher: null,
      },
    ];

    // Create orders and corresponding deliveries
    for (const data of orderData) {
      // Create order
      const order = new Order({
        customerId: data.customer,
        product: data.product,
        status: data.status,
        pickupAddress: data.pickupAddress,
        pickupPhone: data.pickupPhone,
        deliveryAddress: data.deliveryAddress,
        deliveryPhone: data.deliveryPhone,
        details: data.details,
        priority: data.priority,
      });

      await order.save();

      // Create corresponding delivery
      const delivery = new Delivery({
        customerId: data.customer,
        dispatcherId: data.dispatcher,
        product: data.product,
        status: data.status,
        pickupAddress: data.pickupAddress,
        pickupPhone: data.pickupPhone,
        deliveryAddress: data.deliveryAddress,
        deliveryPhone: data.deliveryPhone,
        details: data.details,
        priority: data.priority,
        date: new Date().toISOString().split("T")[0],
        estimatedDeliveryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        actualDeliveryTime: data.status === "Delivered" ? new Date() : null,
      });

      await delivery.save();

      // Link delivery to order
      order.deliveryId = delivery._id;
      await order.save();
    }

    console.log("Created sample orders and deliveries");

    console.log("\n=== SEEDING COMPLETED ===");
    console.log("\nTest accounts created:");
    console.log("Admin: admin@delivery.com / admin123");
    console.log("Dispatcher: dispatcher@delivery.com / dispatcher123");
    console.log("Customer: user@delivery.com / user123");
    console.log("Dispatcher 2: mike@delivery.com / mike123");
    console.log("Customer 2: sarah@delivery.com / sarah123");
    console.log("\nYou can now test the application with these accounts!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
  process.exit(0);
};

runSeed();
