const Transaction = require("../models/Transaction");
const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createSchema = z.object({
  amount: z.coerce.number().finite().positive("Amount must be > 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(60).optional(),
  note: z.string().trim().max(500).optional(),
  date: z.coerce.date().optional()
});

exports.create = asyncHandler(async (req, res) => {
  const payload = createSchema.parse(req.body);
  const data = await Transaction.create({
    ...payload,
    userId: req.user.id
  });
  res.status(201).json(data);
});

exports.getAll = asyncHandler(async (req, res) => {
  const type = (req.query.type ?? "").toString().trim();
  const category = (req.query.category ?? "").toString().trim();
  const startDateRaw = (req.query.startDate ?? "").toString().trim();
  const endDateRaw = (req.query.endDate ?? "").toString().trim();

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 100)));
  const skip = (page - 1) * limit;

  const sortRaw = (req.query.sort ?? "-date").toString().trim();
  const sort = {};
  if (sortRaw === "date") sort.date = 1;
  else if (sortRaw === "-date") sort.date = -1;
  else if (sortRaw === "amount") sort.amount = 1;
  else if (sortRaw === "-amount") sort.amount = -1;
  else sort.date = -1;

  const filter = { userId: req.user.id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDateRaw || endDateRaw) {
    filter.date = {};
    if (startDateRaw) filter.date.$gte = new Date(startDateRaw);
    if (endDateRaw) filter.date.$lte = new Date(endDateRaw);
  }

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(limit),
    Transaction.countDocuments(filter)
  ]);

  res.setHeader("X-Total-Count", String(total));
  res.json(items);
});

const updateSchema = z
  .object({
    amount: z.coerce.number().finite().positive().optional(),
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().trim().min(1).max(60).optional(),
    note: z.string().trim().max(500).optional(),
    date: z.coerce.date().optional()
  })
  .refine((v) => Object.keys(v).length > 0, "No updates provided");

exports.update = asyncHandler(async (req, res) => {
  const updates = updateSchema.parse(req.body);

  const existing = await Transaction.findById(req.params.id);
  if (!existing) throw new AppError("Transaction not found", 404);

  const data = await Transaction.findByIdAndUpdate(req.params.id, updates, {
    new: true
  });
  res.json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  const existing = await Transaction.findById(req.params.id).select("_id");
  if (!existing) throw new AppError("Transaction not found", 404);
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});