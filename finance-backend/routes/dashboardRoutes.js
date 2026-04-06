const router = require("express").Router();
const auth = require("../middleware/auth");

const { summary } = require("../controllers/dashboardController");

// GET dashboard summary
router.get("/", auth, summary);

module.exports = router;