const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");

function monthKey(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

exports.summary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = await Transaction.find({ userId }).sort({ date: -1 });

  let income = 0;
  let expense = 0;
  const categoryTotals = {};
  const monthly = {};

  data.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") income += amt;
    else expense += amt;

    const cat = t.category || "uncategorized";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt * (t.type === "expense" ? -1 : 1);

    const mk = monthKey(t.date);
    if (!monthly[mk]) monthly[mk] = { income: 0, expense: 0, balance: 0 };
    if (t.type === "income") monthly[mk].income += amt;
    else monthly[mk].expense += amt;
    monthly[mk].balance = monthly[mk].income - monthly[mk].expense;
  });

  const recentActivity = data.slice(0, 10).map((t) => ({
    _id: t._id,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    note: t.note
  }));

  res.json({
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    categoryTotals,
    recentActivity,
    monthlyTrends: monthly
  });
});