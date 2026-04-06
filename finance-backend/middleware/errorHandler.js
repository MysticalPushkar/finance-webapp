const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  const statusCode =
    err?.statusCode ||
    (err?.name === "ZodError" ? 400 : undefined) ||
    (err?.name === "ValidationError" ? 400 : undefined) ||
    (err?.name === "CastError" ? 400 : undefined) ||
    500;

  const payload = {
    msg: err?.message || "Server error"
  };

  if (err?.name === "ZodError") {
    payload.details = err.issues?.map((i) => ({
      path: i.path?.join("."),
      message: i.message
    }));
  } else if (err instanceof AppError && err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
};

