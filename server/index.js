const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const db = require("./models");
require("dotenv").config();

const server = express();

// ==================== MIDDLEWARE ====================

// Parse JSON and URL-encoded payloads
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());

// Allowed frontend origins
const allowedOrigins = [
  "https://visitor-management.online",
  "https://www.visitor-management.online",
  "http://localhost:5173",
];

// CORS configuration
server.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // important to allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

// CSRF protection (cookie-based)
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: "Strict" } });
server.use(csrfProtection);

// ==================== ROUTES ====================

const userRoutes = require("./Routes/UserRoutes.js");
server.use("/api/user", userRoutes);

const departmentRoutes = require("./Routes/DepartmentRoutes.js");
server.use("/api/department", departmentRoutes);

const visitorRoutes = require("./Routes/VisitorRoutes.js");
server.use("/api/visitor", visitorRoutes);

const userCategories = require("./Routes/UserCategoryRoutes.js");
server.use("/api/userCategory", userCategories);

const dashboardUrl = require("./Routes/DashboardRoutes.js");
server.use("/api/dashboard", dashboardUrl);

// ==================== CSRF TOKEN ROUTE ====================

// Allow CORS + credentials for this route specifically
server.get(
  "/api/getCSRFToken",
  cors({ origin: allowedOrigins, credentials: true }),
  (req, res) => {
    console.log("CSRF token requested");
    res.json({ csrfToken: req.csrfToken() });
  },
);

// ==================== SERVER START ====================
const port = process.env.PORT || 3000;

db.sequelize.sync({}).then(() => {
  server.listen(port, () => {
    console.log(`\n🚀 Server is running on port ${port}`);
    console.log("✅ CORS and CSRF configured for allowed frontend origins:");
    allowedOrigins.forEach((o) => console.log(" -", o));
  });
});
