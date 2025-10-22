import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
console.log("Current NODE_ENV:", env);
const isTest = env === "test";

const uri = isTest ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;
const dbName = isTest
  ? process.env.DB_NAME_TEST || "storefront_test"
  : process.env.DB_NAME || "storefront";

if (!uri) {
  throw new Error(`❌ Missing MongoDB URI for environment: ${env}`);
}

// 🧠 Safety check
if (isTest && (uri.includes("storefront") && !uri.includes("test"))) {
  throw new Error("🚨 Dangerous: test DB appears to target production!");
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    console.log(`✅ MongoDB already connected (${env}: ${dbName})`);
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
      ssl: true,
    });

    mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));
    mongoose.connection.on("reconnected", () => console.log("🔄 MongoDB reconnected"));
    mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

    console.log(`✅ Connected to MongoDB Atlas (${env}: ${dbName})`);
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
}

export function getDB() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }
  return mongoose.connection.db;
}

export async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
}

export async function clearDB() {
  const env = process.env.NODE_ENV || "development";
  const dbName = mongoose.connection?.name;

  if (!mongoose.connection.readyState) {
    throw new Error("Database not connected — cannot clear.");
  }

  if (env === "production" || dbName === "storefront") {
    throw new Error(
      `🚨 Unsafe operation: Attempted to clear ${dbName} in ${env} environment. Aborting.`
    );
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  console.log(`🧽 Cleared database safely (${env}: ${dbName})`);
}
