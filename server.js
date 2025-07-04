require("dotenv").config();
const csrf = require("csurf");
const csrfProtection = csrf({
  cookie: true,
  httpOnly: true,
  sameSite: "Strict",
});
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const express = require("express");
const {
  authLimiter,
  apiLimiter,
} = require("./middleware/rateLimiterMiddleware");
const { v4: uuidv4 } = require("uuid");
const helmet = require("helmet");
const attachLogger = require("./middleware/loggerMiddleware");
const buildLogger = require("./utils/logger");
const logger = buildLogger("server");
const app = express();

// CONNECT DB
connectDB();

// INCOMING MIDDLEWARES
app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});
app.use(attachLogger("server"));
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

// ROUTES
app.use("/api/protection", apiLimiter, require("./routes/protectionRoutes"));
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/profile", apiLimiter, require("./routes/profileRoutes"));
app.use("/api/connections", apiLimiter, require("./routes/connectionsRoutes"));
app.use(
  "/api/endorsements",
  apiLimiter,
  require("./routes/endorsementsRoutes")
);

// OUTGOING MIDDLEWARES
app.use(require("./middleware/errorHandlerMiddleware"));

// SERVER START
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server started at http://localhost:${PORT}`);
  console.log(`Server started at http://localhost:${PORT}`);
});

// SERVER SHUTDOWN
process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down server...");
  server.close(() => {
    logger.info("Server turned off.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down server...");
  server.close(() => {
    logger.info("Server turned off.");
    process.exit(0);
  });
});
