const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  console.log("verifing the token ========================= ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    console.log("token is valid = == = == = = = = ");
    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.log("token is not valid");
    res.clearCookie("authToken", { httpOnly: true, secure: true });
    return res.status(403).json({ msg: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;
