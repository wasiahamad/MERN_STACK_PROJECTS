import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/responses.js";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/Notification.js";

function mapN(n) {
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    message: n.message,
    time: n.time || n.createdAt,
    read: !!n.read,
  };
}

export const listNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query || {};
  const q = { userId: req.user._id };
  if (String(unreadOnly) === "true") q.read = false;

  const items = await Notification.find(q).sort({ createdAt: -1 }).limit(50);
  return ok(res, { items: items.map(mapN) }, "Notifications");
});

export const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { read } = req.body || {};

  const n = await Notification.findOne({ _id: id, userId: req.user._id });
  if (!n) throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");

  n.read = !!read;
  await n.save();

  return ok(res, { id: String(n._id), read: n.read }, "Notification updated");
});

export const readAll = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  return ok(res, { ok: true }, "All notifications marked read");
});
