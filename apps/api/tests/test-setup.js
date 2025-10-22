// apps/api/tests/test-setup.js
import { beforeAll, afterAll, afterEach } from "vitest";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./setup-test-db.js";
import { seed } from "./seed-test-db.js";

let dbConnected = false;

beforeAll(async () => {
  const dbName = process.env.DB_NAME_TEST;
  if (!dbName || dbName === "storefront") {
    throw new Error("🚨 Refusing to run tests on production database!");
  }

  console.log(`🧠 Connecting to test DB: ${dbName}`);
  await connectTestDB();
  dbConnected = true;

  await clearTestDB();
  try {
    await seed();
    console.log("✅ Test database seeded successfully.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}, 60000);

afterEach(async () => {
  if (dbConnected) await clearTestDB();
});

afterAll(async () => {
  if (dbConnected) {
    await disconnectTestDB();
    dbConnected = false;
  }
});
