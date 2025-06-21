const mongoose = require("mongoose");
const { EMAIL_SCHEMA } = require("./CommonSchema");

const userCredentialsSchema = new mongoose.Schema(
  {
    email: EMAIL_SCHEMA,
    password: { type: String, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "UserCredentials",
  userCredentialsSchema,
  "user_credentials"
);
