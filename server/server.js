const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS Middleware ───────────────────────────────────────────────────────────
// Allow requests from the Vite dev server and common localhost ports.
// In production, replace with your actual frontend domain.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Explicitly handle OPTIONS preflight requests for all routes
app.options("*", cors());

// ─── Body Parsing Middleware ───────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/recruiter", require("./routes/recruiterRoutes"));
app.use("/api/candidate", require("./routes/candidateRoutes"));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Mini Job Portal API is running 🚀",
    version: "1.0.0",
    endpoints: {
      jobs: "/api/jobs",
      jobById: "/api/jobs/:id",
      apply: "/api/jobs/:id/apply",
      applications: "/api/jobs/:id/applications",
      register: "/api/auth/register",
      login: "/api/auth/login",
      me: "/api/auth/me",
    },
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Handle CORS errors gracefully
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS: Origin not allowed" });
  }
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(", ")}`);
});
