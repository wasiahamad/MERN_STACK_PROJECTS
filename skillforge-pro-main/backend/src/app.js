import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { env } from "./config/env.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import recruiterRoutes from "./routes/recruiter.routes.js";
import meRoutes from "./routes/me.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import applicationsRoutes from "./routes/applications.routes.js";
import certificatesRoutes from "./routes/certificates.routes.js";
import daoRoutes from "./routes/dao.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import assessmentsRoutes from "./routes/assessments.routes.js";

export const app = express();

app.use(
  helmet({
    // Frontend runs on a different origin (e.g. :8080) and needs to embed
    // uploaded assets served from this API origin (e.g. :5000).
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  "/uploads",
  express.static(path.resolve("uploads"), {
    setHeaders(res) {
      // Ensure browsers allow embedding these assets cross-origin.
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.get("/health", (req, res) => {
  res.json({ data: { ok: true }, message: "Healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/me", meRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/dao", daoRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/assessments", assessmentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
