// apps/api/tests/seed-test-db.js
import dotenv from "dotenv";
import Customer from "../src/models/customer.model.js";
import Product from "../src/models/product.model.js";
import Order from "../src/models/order.model.js";

dotenv.config();

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min, max) =>
  +(Math.random() * (max - min) + min).toFixed(2);

export async function seed() {
  console.log("🧹 Clearing previous data...");
  await Promise.all([
    Customer.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // 1️⃣ Customers
  const cities = ["Beirut", "Tripoli", "Byblos", "Saida", "Tyre", "Zahle"];
  const names = [
    "Layla Haddad", "Omar Mansour", "Sara Khoury", "Rami El-Hassan",
    "Nour Hamdach", "Tarek Fares", "Maya Azar", "Hassan Barakat",
    "Elie Karam", "Hiba Abbas", "Adel Rahme", "Lina Nassar",
  ];

  const customers = [
    {
      name: "Demo User",
      email: "demo@example.com",
      phone: "+96170000000",
      address: "Beirut, Lebanon",
      createdAt: new Date(),
    },
    ...names.slice(0, 10).map((name) => ({
      name,
      email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      phone: `+9617${Math.floor(100000 + Math.random() * 899999)}`,
      address: random(cities),
      createdAt: new Date(Date.now() - Math.random() * 1e9),
    })),
  ];

  let savedCustomers = [];
  try {
    savedCustomers = await Customer.insertMany(customers, { ordered: false });
  } catch (err) {
    if (err.code === 11000) {
      console.warn("⚠️ Duplicate customer skipped during seeding.");
      savedCustomers = await Customer.find(); // fallback if duplicates occur
    } else throw err;
  }
  console.log(`👥 Inserted ${savedCustomers.length} customers.`);

  // 2️⃣ Products
  const categories = ["electronics", "home", "beauty", "sports", "kitchen", "fashion", "toys"];
  const adjectives = ["Wireless", "Smart", "Portable", "Eco", "Compact", "Luxury", "Durable", "Advanced", "Lightweight", "Ergonomic"];
  const nouns = ["Speaker", "Headphones", "Watch", "Blender", "Camera", "Backpack", "Shoes", "Vacuum", "Hair Dryer", "Yoga Mat", "Lamp", "Coffee Maker", "Tablet", "Perfume", "Jacket", "Gaming Mouse"];

  const products = Array.from({ length: 25 }, () => {
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
  const orders = Array.from({ length: 18 }, () => {
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

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
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

  const demo = savedCustomers.find((c) => c.email === "demo@example.com");
  if (demo) {
    for (let i = 0; i < 3; i++) {
      const p = random(savedProducts);
      orders.push({
        customerId: demo._id,
        items: [{ productId: p._id, name: p.name, price: p.price, quantity: 1 }],
        total: p.price,
        status: random(statuses),
        carrier: random(["DHL", "Aramex"]),
        estimatedDelivery: new Date(Date.now() + 5 * 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  const savedOrders = await Order.insertMany(orders);
  console.log(`📦 Inserted ${savedOrders.length} orders.`);
  console.log("✅ Test database seeded successfully!");
}
