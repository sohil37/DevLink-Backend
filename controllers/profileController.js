const UserProfile = require("../models/UserProfile");
const ApiError = require("../utils/helperClasses");

const updateProfile = async (req, res, session) => {
  try {
    const userId = req.userId; // from authMiddleware
    const reqBody = req.body;
    let userProfile = await UserProfile.findOne({ _id: userId }).session(
      session
    );
    if (!userProfile) userProfile = new UserProfile({ _id: userId });
    userProfile.$set(reqBody);
    userProfile.isProfileComplete =
      userProfile.firstName &&
      userProfile.lastName &&
      userProfile.phoneNo &&
      userProfile.profileSummary &&
      userProfile.location.city &&
      userProfile.location.state &&
      userProfile.location.country &&
      userProfile.skills.length > 0 &&
      userProfile.projects.length > 0 &&
      userProfile.experience.length > 0;
    userProfile.save({ session });
    setResponseJson({
      res,
      msg: "Profile updated",
    });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = { updateProfile };
