const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { corsOptions } = require("./config/cors");
const { rateLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");
const { logger } = require("./utils/logger");
const routes = require("./routes");

const app = express();

app.set("trust proxy", process.env.TRUST_PROXY === "true");

const attachRawBodyForWebhooks = (req, res, buffer) => {
  if (req.originalUrl.startsWith("/api/payment-webhooks/")) {
    req.rawBody = buffer.toString("utf8");
  }
};

// Security & basic middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb", verify: attachRawBodyForWebhooks }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// HTTP logs
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LoadLift API is healthy",
    time: new Date().toISOString(),
  });
});

// API routes
app.use("/api", routes);

// 404 + Error handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
