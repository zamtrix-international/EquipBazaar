const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { corsOptions } = require("./config/cors");
const { rateLimiter } = require('./middlewares/rateLimit.middleware');
const { errorHandler } = require("./middlewares/error.middleware");
const { notFoundHandler } = require("./middlewares/error.middleware");
const { logger } = require("./utils/logger");
const routes = require("./routes");

const app = express();

// Security & basic middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
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

// NOTE: Routes will be mounted here later (auth, users, vendors, etc.)
// Example:
// const routes = require("./routes");
// app.use("/api", routes);
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/vendors", require("./routes/vendor.routes"));

// 404 + Error handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;