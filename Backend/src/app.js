const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const cron = require("node-cron"); // ✅ NEW

const { corsOptions } = require("./config/cors");
const { rateLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");
const { logger } = require("./utils/logger");
const routes = require("./routes");

// ✅ NEW (auto cancel service)
const { cancelExpiredBookings } = require("./services/bookingCleanup.service");

const app = express();

const attachRawBodyForWebhooks = (req, res, buffer) => {
  if (req.originalUrl.startsWith("/api/webhook")) {
    req.rawBody = buffer.toString("utf8");
  }
};

// ✅ STATIC FILE SERVE
app.use(express.static(path.join(__dirname, "../public")));

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

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LoadLift API is healthy",
    time: new Date().toISOString(),
  });
});

// ✅ ROUTES
app.use("/api", routes);

// ❗ CRON JOB (AUTO CANCEL UNPAID BOOKINGS)
cron.schedule("*/5 * * * *", async () => {
  try {
    await cancelExpiredBookings();
    logger.info("Expired bookings cleanup executed");
  } catch (err) {
    logger.error("Booking cleanup failed", err);
  }
});

// 404 + Error handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;