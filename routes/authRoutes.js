const router = require("express").Router();
const authController = require("../controllers/authController");

// ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
