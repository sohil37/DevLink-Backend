const UserProfile = require("../models/UserProfile");
const ApiError = require("../utils/helperClasses");
const { setResponseJson, getExpInfo } = require("../utils/helperFunctions");
const lodash = require("lodash");

const updateProfile = async (req, res, session) => {
  try {
    const userId = req.userId; // from authMiddleware
    let reqBody = req.body;
    const expInfo = getExpInfo(reqBody.experience);
    let userProfile = await UserProfile.findOne({ _id: userId }).session(
      session
    );
    if (!userProfile) userProfile = new UserProfile({ _id: userId });
    userProfile.$set({ ...reqBody, experience: expInfo });
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
      userProfile.experience.totalExpInMonths > 0;
    await userProfile.save({ session });
    setResponseJson({
      res,
      msg: "Profile updated",
    });
  } catch (err) {
    throw new ApiError();
  }
};

const searchProfile = async (req, res, session) => {
  try {
    const { name, city, state, country, skills, minExp, maxExp } = req.body;
    let filter = {};
    if (name) {
      const [firstName, lastName] = lodash.words(name).join(" ").split(" ");
      filter.$or = [
        { firstName: { $regex: firstName, $options: "i" } },
        { lastName: { $regex: lastName || firstName, $options: "i" } },
      ];
    }
    if (city) filter["location.city"] = city;
    if (state) filter["location.state"] = state;
    if (country) filter["location.country"] = country;
    if (skills?.length > 0) filter.skills = { $in: skills };
    if (typeof minExp === "number")
      filter["experience.totalExpInMonths"] = { $gte: minExp };
    if (typeof maxExp === "number")
      filter["experience.totalExpInMonths"] =
        typeof minExp === "number"
          ? { ...filter["experience.totalExpInMonths"], $lte: maxExp }
          : { $lte: maxExp };
    setResponseJson({
      res,
      msg: "Filtered Profiles",
      data: await UserProfile.find(filter).session(session),
    });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = { updateProfile, searchProfile };
