require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const PORT = process.env.PORT || 3000;
const manga = require("./routers/manga");
const chapter = require("./routers/chapter");
const cors = require("cors");
const helmet = require("helmet");

// Create a write stream (in append mode)
const accessLogStream = rfs.createStream("access.log", {
  path: path.join(__dirname), // log directory
  size: "10K", // rotate every 10KB
  interval: "1d", // rotate daily
  maxFiles: 5, // keep up to 5 rotated files
  compress: "gzip", // compress rotated files
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to capture response body
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (body) {
    res.__body_response = body;
    return originalSend.apply(res, arguments);
  };

  res.json = function (body) {
    res.__body_response = body;
    return originalJson.apply(res, arguments);
  };
  next();
});

// Setup the logger
app.use(
  morgan(
    function (tokens, req, res) {
      return JSON.stringify({
        timestamp: tokens.date(req, res, "iso"),
        "remote-address": tokens["remote-addr"](req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        "http-version": tokens["http-version"](req, res),
        status: tokens.status(req, res),
        "content-length": tokens.res(req, res, "content-length"),
        "response-time": tokens["response-time"](req, res) + " ms",
        referrer: tokens.referrer(req, res),
        "user-agent": tokens["user-agent"](req, res),
        "request-body": req.body,
        "response-body": res.__body_response,
      });
    },
    {
      stream: accessLogStream,
    }
  )
);

app.use(cors());
app.use(helmet());
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);
app.use("/api", (req, res) => {
  res.send({
    status: true,
    message:
      "For more info, check out https://github.com/reisvaynard/manga-api, forked from https://github.com/febryardiansyah/manga-api",
    find_me_on: {
      linkedin: "https://www.linkedin.com/in/ibrahim-s-6a796485/",
      github: "https://github.com/reisvaynard",
    },
  });
});
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});

app.listen(PORT, () => {
  console.log("Listening on PORT:" + PORT);
});
