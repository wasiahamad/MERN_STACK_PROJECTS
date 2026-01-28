import { ok } from "../utils/responses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const me = asyncHandler(async (req, res) => {
  return ok(
    res,
    {
      user: {
        id: String(req.user._id),
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        name: req.user.name,
        phone: req.user.phone,
      },
    },
    "Me"
  );
});
