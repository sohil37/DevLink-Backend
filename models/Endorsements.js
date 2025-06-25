const mongoose = require("mongoose");
const { SKILLS } = require("./CommonSchema");

const endorsementsSchema = new mongoose.Schema(
  {
    endorsedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCredentials", // the endorser
      required: true,
    },
    endorsedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile", // the person being endorsed
      required: true,
    },
    skills: SKILLS,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate endorsements
endorsementsSchema.index(
  { endorsedBy: 1, endorsedTo: 1, skill: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Endorsements",
  endorsementsSchema,
  "endorsements"
);
