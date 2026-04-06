const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

function getTokenFromHeader(req) {
  const raw = req.header("Authorization");
  if (!raw) return null;
  if (raw.startsWith("Bearer ")) return raw.slice("Bearer ".length).trim();
  return raw.trim();
}

module.exports = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) throw new AppError("No token", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid token", 401);
  }

  const user = await User.findById(decoded.id).select("_id role status");
  if (!user) throw new AppError("User not found", 401);
  if (user.status !== "active") throw new AppError("User is inactive", 403);

  req.user = { id: String(user._id), role: user.role };
  next();
});