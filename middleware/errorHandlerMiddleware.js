const { setResponseJson } = require("../utils/helperFunctions");

const errorHandler = (err, req, res, next) => {
  const logger = req.loggerWithRoute || console;
  logger.error(`[STACK_TRACE]: ${err.stack}`);
  return setResponseJson({
    res,
    status: err.status || 500,
    msg: err.responseMsg || err.message,
    ...err.data,
  });
};

module.exports = errorHandler;
