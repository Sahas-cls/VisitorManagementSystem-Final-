const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const db = require("./models");
require("dotenv").config();

const server = express();

// Middleware setup
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());
const frontendUrl = process.env.FRONTEND_URL;
console.log("frontend url = ", frontendUrl);

const allowedOrigins = [
  "https://visitor-management.online",
  "https://www.visitor-management.online",
  "http://localhost:5173",
];

// CORS configuration
server.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // if you are using cookies / auth headers
  }),
);

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
server.use(csrfProtection);

// Routes
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

// Start server
const port = process.env.PORT || 3000;
db.sequelize.sync({}).then(() => {
  server.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
});

// research, digital businesscard, VMS, production process, helpdesk, fix assets, location chart
