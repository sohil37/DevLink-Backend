const mongoose = require("mongoose");
const buildLogger = require("../utils/logger");

const logger = buildLogger("dbConnection"); // Log file will be: logs/db/YYYY-MM-DD.log

const connectWithRetry = () => {
  const mongoOptions = {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: false,
  };

  mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      logger.info("MongoDB connected");
    })
    .catch((err) => {
      logger.error(`Initial MongoDB connection failed: ${err.message}`);
      logger.info("Retrying in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};

// Connection lifecycle events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed on app termination");
  process.exit(0);
});

module.exports = connectWithRetry;
