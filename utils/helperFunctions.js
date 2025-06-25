const { default: mongoose } = require("mongoose");
const { TECHNOLOGIES } = require("./constants/regex");
const ApiError = require("./helperClasses");
const { differenceInMonths } = require("date-fns");

const isEndDateValid = (startDate, endDate) =>
  !startDate || endDate >= startDate;

const isTechnologyValid = (tech) => TECHNOLOGIES.test(tech);

const setResponseJson = ({ res, status, msg = "", ...rest }) => {
  const resJson = {
    msg,
    ...rest,
  };
  status ? res.status(status).json(resJson) : res.json(resJson);
};

const mongoTransaction = (apiFunction) => async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Inject session into request so apiFunction can use it
    await apiFunction(req, res, session);
    await session.commitTransaction();
  } catch (err) {
    console.error("Transaction failed:", err);
    await session.abortTransaction();
    const status = err instanceof ApiError ? err.status : 500;
    const message = err.message || "Internal Server Error";
    const data = err instanceof ApiError ? err.data : undefined;
    res.status(status).json({ msg: message, ...(data && { data }) });
  } finally {
    session.endSession();
  }
};

const getExpInfo = (experience = []) => {
  let exp = {
    totalExpInMonths: 0,
    experience: [],
  };
  if (experience.length > 0)
    exp = {
      totalExpInMonths: experience.reduce((sum, exp) => {
        const diff = differenceInMonths(
          new Date(exp.endDate),
          new Date(exp.startDate)
        );
        return sum + diff;
      }, 0),
      experience,
    };
  return exp;
};

module.exports = {
  isEndDateValid,
  isTechnologyValid,
  setResponseJson,
  mongoTransaction,
  getExpInfo,
};
