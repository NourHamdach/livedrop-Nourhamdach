//apps/api/seed.js
import dotenv from "dotenv";
import { connectDB, closeDB } from "./src/db.js";
import Customer from "./src/models/customer.model.js";
import Product from "./src/models/product.model.js";
import Order from "./src/models/order.model.js";

dotenv.config();

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

async function seed() {
  await connectDB();

  console.log("🧹 Clearing old data...");
  await Promise.all([
    Customer.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // 1️⃣ Customers
  const cities = ["Beirut", "Tripoli", "Byblos", "Saida", "Tyre", "Zahle"];
  const names = [
    "Layla Haddad",
    "Omar Mansour",
    "Sara Khoury",
    "Rami El-Hassan",
    "Nour Hamdach", // You can include your own name
    "Tarek Fares",
    "Maya Azar",
    "Hassan Barakat",
    "Elie Karam",
    "Hiba Abbas",
    "Adel Rahme",
    "Lina Nassar",
  ];

  const customers = [
    {
      name: "Demo User",
      email: "demo@example.com", // documented test user
      phone: "+96170000000",
      address: "Beirut, Lebanon",
      createdAt: new Date(),
    },
    ...names.slice(0, 10).map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      phone: `+9617${Math.floor(100000 + Math.random() * 899999)}`,
      address: random(cities),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1e9)),
    })),
  ];

  const savedCustomers = await Customer.insertMany(customers);
  console.log(`👥 Inserted ${savedCustomers.length} customers.`);

  // 2️⃣ Products
  const categories = [
    "electronics",
    "home",
    "beauty",
    "sports",
    "kitchen",
    "fashion",
    "toys",
  ];

  const adjectives = [
    "Wireless",
    "Smart",
    "Portable",
    "Eco",
    "Compact",
    "Luxury",
    "Durable",
    "Advanced",
    "Lightweight",
    "Ergonomic",
  ];

  const nouns = [
    "Speaker",
    "Headphones",
    "Watch",
    "Blender",
    "Camera",
    "Backpack",
    "Shoes",
    "Vacuum",
    "Hair Dryer",
    "Yoga Mat",
    "Lamp",
    "Coffee Maker",
    "Tablet",
    "Perfume",
    "Jacket",
    "Gaming Mouse",
  ];

  const products = Array.from({ length: 25 }).map(() => {
    const name = `${random(adjectives)} ${random(nouns)}`;
    return {
      name,
      description: `High-quality ${name.toLowerCase()} for modern lifestyles.`,
      price: randomPrice(5, 500),
      category: random(categories),
      tags: [random(categories)],
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`,
      stock: Math.floor(Math.random() * 50) + 1,
    };
  });

  const savedProducts = await Product.insertMany(products);
  console.log(`🛍️  Inserted ${savedProducts.length} products.`);

  // 3️⃣ Orders
  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

  const orders = Array.from({ length: 18 }).map(() => {
    const customer = random(savedCustomers);
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = Array.from({ length: itemCount }).map(() => {
      const p = random(savedProducts);
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: Math.ceil(Math.random() * 2),
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      customerId: customer._id,
      items,
      total: +total.toFixed(2),
      status: random(statuses),
      carrier: random(["DHL", "Aramex", "LibanPost"]),
      estimatedDelivery: new Date(Date.now() + (Math.random() * 7 + 3) * 86400000),
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
      updatedAt: new Date(),
    };
  });

  // Give test user 2–3 orders
  const demoCustomer = savedCustomers.find(c => c.email === "demo@example.com");
  for (let i = 0; i < 3; i++) {
    const p = random(savedProducts);
    orders.push({
      customerId: demoCustomer._id,
      items: [{ productId: p._id, name: p.name, price: p.price, quantity: 1 }],
      total: p.price,
      status: random(statuses),
      carrier: random(["DHL", "Aramex"]),
      estimatedDelivery: new Date(Date.now() + 5 * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const savedOrders = await Order.insertMany(orders);
  console.log(`📦 Inserted ${savedOrders.length} orders.`);

  console.log("✅ Database successfully seeded!");
  await closeDB();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  closeDB();
});
