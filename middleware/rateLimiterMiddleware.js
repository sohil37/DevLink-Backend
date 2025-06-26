const rateLimit = require("express-rate-limit");
const { setResponseJson } = require("../utils/helperFunctions");

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMITER_DUR),
  max: Number(process.env.AUTH_RATE_LIMITER_MAX_REQ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return setResponseJson({
      res,
      status: options.statusCode,
      msg: `Too many requests. Please try again after ${
        process.env.AUTH_RATE_LIMITER_DUR / 1000
      } seconds.`,
    });
  },
});

const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMITER_DUR),
  max: Number(process.env.API_RATE_LIMITER_MAX_REQ),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return setResponseJson({
      res,
      status: options.statusCode,
      msg: `Too many requests. Please try again after ${
        process.env.API_RATE_LIMITER_DUR / 1000
      } seconds.`,
    });
  },
});

module.exports = { apiLimiter, authLimiter };
