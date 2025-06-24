const { default: mongoose } = require("mongoose");
const { TECHNOLOGIES } = require("./constants/regex");
const ApiError = require("./helperClasses");

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

module.exports = {
  isEndDateValid,
  isTechnologyValid,
  setResponseJson,
  mongoTransaction,
};
