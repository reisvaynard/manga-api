const path = require("path");
const rfs = require("rotating-file-stream");

// Create a rotating write stream
const apiLogStream = rfs.createStream("api.log", {
  path: path.join(__dirname, ".."),
  size: "10K",
  maxFiles: 5,
  compress: "gzip",
});

/**
 * Logs data to the api.log file.
 * @param {object} logData The data to log.
 */
const logToApi = (logData) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...logData,
  };
  apiLogStream.write(JSON.stringify(logEntry) + "\n");
};

module.exports = logToApi;
