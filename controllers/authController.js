const UserCredentials = require("../models/UserCredentials");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSession = require("../models/UserSession");

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
register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isUsernameExists = await UserCredentials.findOne({ username });
    if (isUsernameExists)
      return res
        .status(409)
        .json({ msg: "Username already exists", isExists: "username" });
    const isEmailExists = await UserCredentials.findOne({ email });
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
    await userCredentials.save();
    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN
login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserCredentials.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    let userSession = await UserSession.findOne({ _id: user._id });
    if (!userSession) userSession = new UserSession({ _id: user._id });
    userSession.refreshToken = refreshToken;
    await userSession.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// REFRESH TOKEN
refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ msg: "No token" });

    const userSession = await UserSession.findOne({ refreshToken: token });
    if (!userSession)
      return res.status(403).json({ msg: "Invalid refresh token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.userId !== userSession._id.toString())
        return res.status(403).json({ msg: "Invalid refresh token" });

      const newAccessToken = generateAccessToken(userSession._id);
      res.json({ accessToken: newAccessToken });
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGOUT
logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const userSession = await UserSession.findOne({ refreshToken: token });
      if (userSession) {
        userSession.refreshToken = null;
        await userSession.save();
      }
    }
    res.clearCookie("refreshToken");
    res.json({ msg: "Logged out" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
