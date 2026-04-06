const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["viewer", "analyst", "admin"]).optional()
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email }).select("_id");
  if (existing) throw new AppError("Email already registered", 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: role ?? "viewer"
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  });
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  password: z.string().min(1, "Password is required")
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 400);
  if (user.status !== "active") throw new AppError("User is inactive", 403);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError("Wrong password", 400);

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });
});