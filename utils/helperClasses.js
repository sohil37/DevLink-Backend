class ApiError extends Error {
  constructor(message, responseMsg = "", status = 500, data = null) {
    super(message);
    this.responseMsg = responseMsg;
    this.status = status;
    if (data) this.data = data;
  }
}

module.exports = ApiError;
