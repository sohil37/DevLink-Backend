const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const { mongoTransaction } = require("../utils/helperFunctions");
const attachLogger = require("../middleware/loggerMiddleware");

// MIDDLEWARE
router.use(attachLogger("profileController"));

// ROUTES
router.put(
  "/update",
  verifyToken,
  mongoTransaction(profileController.updateProfile)
);
router.post(
  "/search",
  verifyToken,
  mongoTransaction(profileController.searchProfile)
);

module.exports = router;
