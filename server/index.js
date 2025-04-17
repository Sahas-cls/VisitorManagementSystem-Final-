const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const db = require("./models");

const server = express();

// Middleware setup
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
server.use(cors(corsOptions));

// server.use(cors());

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
server.use(csrfProtection);

// Importing user routes
const userRoutes = require("./Routes/UserRoutes.js");
server.use("/user", userRoutes);
// Importing department routes
const departmentRoutes = require("./Routes/DepartmentRoutes.js");
server.use("/department", departmentRoutes);

const visiterRoutes = require("./Routes/VisitorRoutes.js");
server.use("/visitor", visiterRoutes);

const userCategories = require("./Routes/UserCategoryRoutes.js");
server.use("/userCategory", userCategories)

// Generating CSRF token
server.get("/getCSRFToken", (req, res) => {
  // console.log(req.csrfToken());
  console.log("csrftoken requested");
  console.log(req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

const port = process.env.PORT || 3000;
db.sequelize.sync().then(() => {
  server.listen(port, () => console.log(`Server is running on port ${port}`));
});
