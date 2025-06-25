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
router.put(
  "/acceptRequest",
  verifyToken,
  mongoTransaction(connectionsController.acceptConnRequest)
);
router.get(
  "/getConnections",
  verifyToken,
  mongoTransaction(connectionsController.getConnections)
);

module.exports = router;
