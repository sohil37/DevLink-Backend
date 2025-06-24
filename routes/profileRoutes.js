const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const { mongoTransaction } = require("../utils/helperFunctions");

// ROUTES
router.put(
  "/update",
  verifyToken,
  mongoTransaction(profileController.updateProfile)
);

module.exports = router;
