const UserCredentials = require("../models/UserCredentials");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSession = require("../models/UserSession");
const UserProfile = require("../models/UserProfile");
const { setResponseJson } = require("../utils/helperFunctions");
const ApiError = require("../utils/helperClasses");

// GENERATE TOKENS
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

// REGISTER
const register = async (req, res, session) => {
  try {
    const { username, email, password } = req.body;
    const isUsernameExists = await UserCredentials.findOne({
      username,
    }).session(session);
    if (isUsernameExists)
      return res
        .status(409)
        .json({ msg: "Username already exists", isExists: "username" });
    const isEmailExists = await UserCredentials.findOne({ email }).session(
      session
    );
    if (isEmailExists)
      return res
        .status(409)
        .json({ msg: "Email already exists", isExists: "email" });
    const hash = await bcrypt.hash(password, 10);
    const userCredentials = new UserCredentials({
      username,
      email,
      password: hash,
    });
    await userCredentials.save({ session });
    setResponseJson({ res, status: 201, msg: "User registered" });
  } catch (err) {
    throw new ApiError();
  }
};

// LOGIN
const login = async (req, res, session) => {
  try {
    const { email, password } = req.body;
    const user = await UserCredentials.findOne({ email }).session(session);
    if (!user)
      return setResponseJson({ res, status: 401, msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return setResponseJson({ res, status: 401, msg: "Invalid credentials" });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    let userSession = await UserSession.findOne({ _id: user._id }).session(
      session
    );
    if (!userSession) userSession = new UserSession({ _id: user._id });
    userSession.refreshToken = refreshToken;
    await userSession.save({ session });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    setResponseJson({ res, msg: "Access token generated", accessToken });
  } catch (err) {
    throw new ApiError();
  }
};

// REFRESH TOKEN
const refresh = async (req, res, session) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return setResponseJson({ res, status: 401, msg: "No token" });
    const userSession = await UserSession.findOne({
      refreshToken: token,
    }).session(session);
    if (!userSession)
      return setResponseJson({
        res,
        status: 403,
        msg: "Invalid refresh token",
      });
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.userId !== userSession._id.toString())
        return setResponseJson({
          res,
          status: 403,
          msg: "Invalid refresh token",
        });
      const newAccessToken = generateAccessToken(userSession._id);
      setResponseJson({
        res,
        msg: "New access token generated",
        accessToken: newAccessToken,
      });
    });
  } catch (err) {
    throw new ApiError();
  }
};

// LOGOUT
const logout = async (req, res, session) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const userSession = await UserSession.findOne({
        refreshToken: token,
      }).session(session);
      if (userSession) {
        userSession.refreshToken = null;
        await userSession.save({ session });
      }
    }
    res.clearCookie("refreshToken");
    setResponseJson({
      res,
      msg: "Logged out",
    });
  } catch (err) {
    throw new ApiError();
  }
};

// DELETE
const deleteAccount = async (req, res, session) => {
  try {
    const userId = req.userId; // from authMiddleware
    // delete user profile
    const userProfileResult = await UserProfile.deleteOne({
      _id: userId,
    }).session(session);
    if (userProfileResult.deletedCount > 0) {
      console.log(
        `Document deleted from "user_profile" collection for _id: ${userId}.`
      );
    } else {
      console.log(
        `No document found for _id: ${userId} in "user_profile" collection to delete.`
      );
    }
    // delete user session
    const userSessionResult = await UserSession.deleteOne({
      _id: userId,
    }).session(session);
    if (userSessionResult.deletedCount > 0) {
      console.log(
        `Document deleted from "user_session" collection for _id: ${userId}.`
      );
    } else {
      console.log(
        `No document found for _id: ${userId} in "user_session" collection to delete.`
      );
    }
    // delete user credentials
    const userCredResult = await UserCredentials.deleteOne({
      _id: userId,
    }).session(session);
    if (userCredResult.deletedCount > 0) {
      console.log(
        `Document deleted from "user_credentials" collection for _id: ${userId}.`
      );
    } else {
      console.log(
        `No document found for _id: ${userId} in "user_credentials" collection to delete.`
      );
    }
    setResponseJson({
      res,
      msg: "Account deleted successfully",
    });
  } catch (err) {
    throw new ApiError();
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  deleteAccount,
};
