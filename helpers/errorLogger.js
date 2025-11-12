const fs = require("fs");
const path = require("path");
const rfs = require("rotating-file-stream");

// Create a write stream for errors (in append mode)
const errorLogStream = rfs.createStream("error.log", {
  path: path.join(__dirname, ".."),
  size: "10K",
  maxFiles: 5,
  compress: "gzip",
});

/**
 * Logs an error to the error.log file in a structured JSON format.
 * @param {Error} err The error object.
 * @param {import('express').Request} req The Express request object for context.
 * @param {object} responseBody The JSON body of the error response being sent.
 */
const logError = (err, req, responseBody) => {
  const now = new Date();
  // Ensure responseBody is captured, even if it's what was on res object
  const finalResponseBody =
    responseBody || (req.res ? req.res.__body_response : undefined);
  const logData = {
    timestamp: now.toISOString(),
    level: "error",
    message: err.message,
    stack: err.stack,
    ...(req && {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      "request-body": req.body,
    }),
    "response-body": finalResponseBody,
  };
  errorLogStream.write(JSON.stringify(logData) + "\n");
};

module.exports = logError;
