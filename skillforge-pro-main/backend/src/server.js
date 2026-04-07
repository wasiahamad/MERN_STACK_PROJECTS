import http from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./config/db.js";

const server = http.createServer(app);

async function bootstrap() {
  try {
    await connectDb(env.MONGO_URI);
  } catch (err) {
    if (env.NODE_ENV === "production") {
      throw err;
    }
    // In local dev, keep API booted even if Atlas DNS/network is temporarily down.
    // eslint-disable-next-line no-console
    console.warn("MongoDB connection failed in dev mode, continuing without DB:", err.message);
  }
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${env.PORT}`);
  });
}

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\nShutting down (${signal})...`);
  try {
    server.close();
    await disconnectDb();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});
