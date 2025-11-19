const axios = require("axios").default;
const { baseUrl } = require("../constants/urls");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const logToApi = require("./apiLogger");

// Create a dedicated axios instance
const instance = axios.create({
  baseURL: baseUrl,
});

axiosCookieJarSupport(instance);

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    logToApi({
      level: "info",
      message: "Outgoing API Request",
      method: config.method,
      url: instance.getUri(config),
    });
    return config;
  },
  (error) => {
    logToApi({
      level: "error",
      message: "Outgoing API Request Error",
      error: error.message,
    });
    return Promise.reject(error);
  }
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    logToApi({
      level: "info",
      message: "Received API Response",
      status: response.status,
    });
    return response;
  },
  (error) => {
    logToApi({
      level: "error",
      message: "Received API Response Error",
      status: error.response ? error.response.status : "No response",
    });
    return Promise.reject(error);
  }
);

module.exports = instance;
