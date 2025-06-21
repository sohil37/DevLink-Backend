const mongoose = require("mongoose");
const {
  PHONE_NO_SCHEMA,
  PROFILE_SUMMARY,
  SKILLS,
  PROJECTS,
  FIRST_NAME,
  EMAIL_SCHEMA,
  LAST_NAME,
  LOCATION,
  EXPERIENCE,
} = require("./CommonSchema");

const userProfileSchema = new mongoose.Schema(
  {
    firstName: FIRST_NAME,
    lastName: LAST_NAME,
    phoneNo: PHONE_NO_SCHEMA,
    profileSummary: PROFILE_SUMMARY,
    location: LOCATION,
    skills: SKILLS,
    projects: PROJECTS,
    experience: EXPERIENCE,
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "UserProfile",
  userProfileSchema,
  "user_profile"
);
