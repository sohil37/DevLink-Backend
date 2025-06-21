const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// ROUTES
router.put("/update", verifyToken, profileController.updateProfile);

module.exports = router;
