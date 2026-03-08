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

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LoadLift API is healthy",
    time: new Date().toISOString(),
  });
});

<<<<<<< HEAD
/* ✅ FIX: ROUTES MOUNT */
=======
// API routes
>>>>>>> 8b74ad53ef335469c8c895d0db8e151feed63729
app.use("/api", routes);

/* error handlers */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
