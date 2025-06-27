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
  const logger = req.loggerWithRoute;
  try {
    const { email, password } = req.body;
    logger.info(`User requested to register with email "${email}"`);
    const isEmailExists = await UserCredentials.findOne({ email }).session(
      session
    );
    if (isEmailExists)
      throw new ApiError(
        `User Registration Failed. Email "${email}" already exists`,
        "Email already exist",
        409,
        {
          isExists: "email",
        }
      );
    const hash = await bcrypt.hash(password, 10);
    const userCredentials = new UserCredentials({
      email,
      password: hash,
    });
    await userCredentials.save({ session });
    logger.info(`User "${userCredentials._id}" created for email "${email}"`);
    setResponseJson({
      res,
      status: 201,
      msg: "User registered",
      id: userCredentials._id,
    });
    logger.info(`Successful response sent to user "${userCredentials._id}"`);
  } catch (err) {
    throw err;
  }
};

// LOGIN
const login = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const { email, password } = req.body;
    logger.info(`User requested to login with email "${email}"`);
    const user = await UserCredentials.findOne({ email }).session(session);
    if (!user)
      throw new ApiError(
        `Login Failed: Invalid credentials for email "${email}"`,
        "Invalid credentials",
        401
      );
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new ApiError(
        `Login Failed: Invalid credentials for email "${email}"`,
        "Invalid credentials",
        401
      );
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    let userSession = await UserSession.findOne({ _id: user._id }).session(
      session
    );
    if (!userSession) userSession = new UserSession({ _id: user._id });
    userSession.refreshToken = refreshToken;
    await userSession.save({ session });
    logger.info(
      `Session created for user "${user._id}" having email "${email}"`
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    setResponseJson({ res, msg: "Access token generated", accessToken });
    logger.info(
      `Login Successful: Access token sent to user "${user._id}" having email "${email}"`
    );
  } catch (err) {
    throw err;
  }
};

// REFRESH TOKEN
const refresh = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  const userId = req.userId; // from authMiddleware
  logger.info(`New access token requested by user "${userId}"`);
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      throw new ApiError(
        `Refresh Token Failed: No token sent by user "${userId}"`,
        "No refresh token sent",
        401
      );
    const userSession = await UserSession.findOne({
      refreshToken: token,
    }).session(session);
    if (!userSession)
      throw new ApiError(
        `Refresh Token Failed: Invalid refresh token sent by user "${userId}"`,
        "Invalid refresh token",
        403
      );
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.userId !== userId)
        throw new ApiError(
          `Refresh Token Failed: Invalid refresh token sent by user "${userId}"`,
          "Invalid refresh token",
          403
        );
      const newAccessToken = generateAccessToken(userId);
      setResponseJson({
        res,
        msg: "New access token generated",
        accessToken: newAccessToken,
      });
      logger.info(`New access token sent to user "${userId}"`);
    });
  } catch (err) {
    throw err;
  }
};

// LOGOUT
const logout = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    const token = req.cookies.refreshToken;
    logger.info(`Logout requested by user "${userId}"`);
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
    logger.info(`Logout successful for user "${userId}"`);
  } catch (err) {
    throw err;
  }
};

// DELETE
const deleteAccount = async (req, res, session) => {
  const logger = req.loggerWithRoute;
  try {
    const userId = req.userId; // from authMiddleware
    logger.info(`Delete account requested by user "${userId}"`);
    // delete user profile
    const userProfileResult = await UserProfile.deleteOne({
      _id: userId,
    }).session(session);
    if (userProfileResult.deletedCount > 0) {
      logger.info(
        `Document deleted from "user_profile" collection for user "${userId}"`
      );
    } else {
      logger.info(
        `No document found for user "${userId}" in "user_profile" collection to delete`
      );
    }
    // delete user session
    const userSessionResult = await UserSession.deleteOne({
      _id: userId,
    }).session(session);
    if (userSessionResult.deletedCount > 0) {
      logger.info(
        `Document deleted from "user_session" collection for user "${userId}"`
      );
    } else {
      logger.info(
        `No document found for user "${userId}" in "user_session" collection to delete`
      );
    }
    // delete user credentials
    const userCredResult = await UserCredentials.deleteOne({
      _id: userId,
    }).session(session);
    if (userCredResult.deletedCount > 0) {
      logger.info(
        `Document deleted from "user_credentials" collection for user "${userId}"`
      );
    } else {
      logger.info(
        `No document found for user "${userId}" in "user_credentials" collection to delete`
      );
    }
    setResponseJson({
      res,
      msg: "Account deleted successfully",
    });
    logger.info(`Account deleted successfully for user "${userId}"`);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  deleteAccount,
};
