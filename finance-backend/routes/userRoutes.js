const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  getMe,
  listUsers,
  updateUser
} = require("../controllers/userController");

// logged-in user info
router.get("/me", auth, getMe);

// admin user management
router.get("/", auth, role("admin"), listUsers);
router.put("/:id", auth, role("admin"), updateUser);

module.exports = router;

