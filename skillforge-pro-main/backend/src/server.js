import http from "http";
import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";

const server = http.createServer(app);

async function bootstrap() {
  await mongoose.connect(env.MONGO_URI);
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});
