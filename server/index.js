const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const db = require("./models");
require("dotenv").config();

const server = express();

// ==================== MIDDLEWARE ====================

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());

// Allow both www and non-www
const allowedOrigins = [
  "https://visitor-management.online",
  "https://www.visitor-management.online",
  "http://localhost:5173",
];

// Apply CORS to all routes
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
  }
  // Handle preflight requests
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

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

// CSRF token route
server.get("/api/getCSRFToken", (req, res) => {
  console.log("CSRF token requested");
  res.json({ csrfToken: req.csrfToken() });
});

// ==================== SERVER START ====================
const port = process.env.PORT || 3000;
db.sequelize.sync({}).then(() => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log("✅ CORS configured for allowed origins:");
    allowedOrigins.forEach((o) => console.log(" -", o));
  });
});
