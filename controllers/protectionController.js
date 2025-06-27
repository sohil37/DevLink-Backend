const getCsrfToken = (req, res) => {
  const logger = req.loggerWithRoute;
  const reqInfo = {
    host: req.headers.host,
    "user-agent": req.headers["user-agent"],
    ip: req.ip,
  };
  logger.info(
    `User requested CSRF token. [Request Info = ${JSON.stringify(reqInfo)}]`
  );
  res.json({ csrfToken: req.csrfToken() });
  logger.info(
    `CSRF token sent to user. [Request Info = ${JSON.stringify(reqInfo)}]`
  );
};

module.exports = { getCsrfToken };
