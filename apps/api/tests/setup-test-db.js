// apps/api/tests/setup-test-db.js
import { connectDB, closeDB, clearDB } from "../src/db.js";

export async function connectTestDB() {
  process.env.NODE_ENV = "test";
  await connectDB();
}

export async function disconnectTestDB() {
  await closeDB();
}

export async function clearTestDB() {
  await clearDB();
}
