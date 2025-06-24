const router = require("express").Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { mongoTransaction } = require("../utils/helperFunctions");

// ROUTES
router.post("/register", mongoTransaction(authController.register));
router.post("/login", mongoTransaction(authController.login));
router.get("/refresh", mongoTransaction(authController.refresh));
router.post("/logout", mongoTransaction(authController.logout));
router.delete(
  "/delete",
  verifyToken,
  mongoTransaction(authController.deleteAccount)
);

module.exports = router;
