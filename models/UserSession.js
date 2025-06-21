const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    refreshToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "UserSession",
  userSessionSchema,
  "user_session"
);
