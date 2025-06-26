const buildLogger = require("../utils/logger");

const loggerWithRequestId = (label) => (req, res, next) => {
  const logger = buildLogger(label);
  const wrap = (level) => (message) => {
    logger.log({
      level,
      message,
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId, // should be set by requestId middleware
    });
  };
  req.loggerWithRoute = {
    info: wrap("info"),
    error: wrap("error"),
    warn: wrap("warn"),
    debug: wrap("debug"),
  };
  next();
};

module.exports = loggerWithRequestId;
