const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const endorsementsController = require("../controllers/endorsementController");
const { mongoTransaction } = require("../utils/helperFunctions");

// ROUTES
router.put(
  "/sendEndorsements",
  verifyToken,
  mongoTransaction(endorsementsController.sendEndorsements)
);
router.post(
  "/getEndorsements",
  verifyToken,
  mongoTransaction(endorsementsController.getEndorsements)
);

module.exports = router;
