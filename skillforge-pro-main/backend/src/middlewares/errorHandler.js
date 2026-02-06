import { ApiError } from "../utils/ApiError.js";

export function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : Number.isInteger(err?.status) ? err.status : 500;
  const code = err instanceof ApiError ? err.code : typeof err?.code === "string" ? err.code : "INTERNAL";
  const message = err?.message || "Something went wrong";

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
