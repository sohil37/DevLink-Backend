const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const connectionsController = require("../controllers/connectionsController");
const { mongoTransaction } = require("../utils/helperFunctions");

// ROUTES
router.post(
  "/sendRequest",
  verifyToken,
  mongoTransaction(connectionsController.sendConnRequest)
);
router.post(
  "/removeRequest",
  verifyToken,
  mongoTransaction(connectionsController.removeConnRequest)
);

module.exports = router;
