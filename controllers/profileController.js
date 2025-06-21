const UserProfile = require("../models/UserProfile");

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId; // from authMiddleware
    const reqBody = req.body;
    let userProfile = await UserProfile.findOne({ _id: userId });
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
    userProfile.save();
    res.json({ msg: "Profile updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { updateProfile };
