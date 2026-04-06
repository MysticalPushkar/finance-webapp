const router = require("express").Router();

// middleware
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// controller functions
const {
  create,
  getAll,
  update,
  delete: deleteTransaction
} = require("../controllers/transactionController");

// 🔥 Routes

// Create transaction (ONLY ADMIN)
router.post("/", auth, role("admin"), create);

// Get all transactions (logged in user)
router.get("/", auth, getAll);

// Update transaction (ONLY ADMIN)
router.put("/:id", auth, role("admin"), update);

// Delete transaction (ONLY ADMIN)
router.delete("/:id", auth, role("admin"), deleteTransaction);

module.exports = router;