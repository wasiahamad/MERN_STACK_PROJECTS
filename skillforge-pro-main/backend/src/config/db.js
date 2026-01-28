import mongoose from "mongoose";

export async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error("Missing MongoDB connection string");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  return conn;
}

export async function disconnectDb() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
