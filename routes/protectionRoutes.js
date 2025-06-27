const router = require("express").Router();
const protectionController = require("../controllers/protectionController");
const { mongoTransaction } = require("../utils/helperFunctions");
const attachLogger = require("../middleware/loggerMiddleware");

// MIDDLEWARE
router.use(attachLogger("protectionController"));

// ROUTES
router.get("/csrfToken", mongoTransaction(protectionController.getCsrfToken));

module.exports = router;
