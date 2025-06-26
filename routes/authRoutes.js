const router = require("express").Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { mongoTransaction } = require("../utils/helperFunctions");
const attachLogger = require("../middleware/loggerMiddleware");

// MIDDLEWARE
router.use(attachLogger("authController"));

// ROUTES
router.post("/register", mongoTransaction(authController.register));
router.post("/login", mongoTransaction(authController.login));
router.get("/refresh", verifyToken, mongoTransaction(authController.refresh));
router.post("/logout", verifyToken, mongoTransaction(authController.logout));
router.delete(
  "/delete",
  verifyToken,
  mongoTransaction(authController.deleteAccount)
);

module.exports = router;
