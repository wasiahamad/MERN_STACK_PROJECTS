import express from "express";

import { submitContact } from "../controllers/contact.controller.js";
import { contactLimiter } from "../middlewares/rateLimiters.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

router.post("/", contactLimiter, optionalAuth, submitContact);

export default router;
