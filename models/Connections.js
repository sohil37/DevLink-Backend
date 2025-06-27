const mongoose = require("mongoose");

const connectionsSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

connectionsSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model(
  "Connections",
  connectionsSchema,
  "connections"
);
