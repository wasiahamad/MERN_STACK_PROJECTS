import { v2 as cloudinary } from "cloudinary";

import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

let configured = false;

export function ensureCloudinaryConfigured() {
  if (configured) return;

  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(
      500,
      "CLOUDINARY_NOT_CONFIGURED",
      "Cloudinary is not configured. Set CLOUDINARY_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET (or CLOUDNARY_*)."
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
}

export async function uploadImageBuffer(buffer, options = {}) {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "skillforge/avatars",
        overwrite: true,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}
