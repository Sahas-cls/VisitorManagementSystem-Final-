const express = require("express");
const UserCategoryRoute = express.Router();
const db = require("../models");
const tblUCategory = db.User_Categories;

// *to get all user categories
UserCategoryRoute.get("/getAllCategories", async (req, res) => {
  console.log("getting categories");

  try {
    const userCategories = await tblUCategory.findAll();
    if (userCategories) {
      res.status(200).json({ data: userCategories });
    }
  } catch (error) {
    console.error("error while fetching user categories: " + error.message);
  }
  // res.status(200).json({ data: "providing user categories" });
  // Add your logic to fetch categories here
});

module.exports = UserCategoryRoute;
