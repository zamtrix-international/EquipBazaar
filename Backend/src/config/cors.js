const corsOptions = {
  origin: (origin, cb) => {
    // Allow mobile apps / Postman (no origin)
    if (!origin) return cb(null, true);

    // TODO: Put your frontend domains here when ready
    const allowed = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: Origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

module.exports = { corsOptions };