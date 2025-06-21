const { TECHNOLOGIES } = require("./constants/regex");

const isEndDateValid = (startDate, endDate) =>
  !startDate || endDate >= startDate;

const isTechnologyValid = (tech) => TECHNOLOGIES.test(tech);

module.exports = { isEndDateValid, isTechnologyValid };
