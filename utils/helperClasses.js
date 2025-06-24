class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

module.exports = ApiError;
