const User = require("../models/User");
const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "_id name email role status"
  );
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const skip = (page - 1) * limit;

  const q = (req.query.q ?? "").toString().trim();
  const role = (req.query.role ?? "").toString().trim();
  const status = (req.query.status ?? "").toString().trim();

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("_id name email role status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.setHeader("X-Total-Count", String(total));
  res.json({
    items,
    page,
    limit,
    total
  });
});

const updateUserSchema = z.object({
  role: z.enum(["viewer", "analyst", "admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  name: z.string().trim().min(1).optional()
});

exports.updateUser = asyncHandler(async (req, res) => {
  const updates = updateUserSchema.parse(req.body);
  if (Object.keys(updates).length === 0) {
    throw new AppError("No updates provided", 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true
  }).select("_id name email role status");

  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

