const { createLogger, format } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const logRoot = path.join(__dirname, "..", "logs");

// Ensures log directory exists
const ensureLogDir = (label) => {
  const logDir = path.join(logRoot, label);
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  return logDir;
};

// Create Winston logger for a given label (e.g., 'auth', 'profile')
const buildLogger = (label) => {
  const logDir = ensureLogDir(label);
  return createLogger({
    level: "info",
    format: format.combine(
      format.label({ label }),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(
        ({ level, message, timestamp, label, method, path, requestId }) => {
          const methodPath = method && path ? `[${method} ${path}]` : "";
          const reqId = requestId ? `[reqId: ${requestId}]` : "";
          return `[${timestamp}] [${label}] ${methodPath} ${reqId} [${level.toUpperCase()}]: ${message}`;
        }
      )
    ),
    transports: [
      new DailyRotateFile({
        dirname: logDir,
        filename: `%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
        zippedArchive: true,
      }),
    ],
  });
};

module.exports = buildLogger;
