const express = require("express");
const departmentRoutes = express.Router();
const db = require("../models");
const tblDepartment = db.Departments;
const { Factory } = require("../models");
const { where } = require("sequelize");

// *to departments according to factory code
departmentRoutes.get("/getDep/:factoryId", async (req, res) => {
  console.log("providing factories =========================== ");
  console.log("route was called");
  console.log("fac id: " + req.params.factoryId);
  let factoryId = req.params.factoryId;
  // return;
  try {
    const departmentList = await tblDepartment.findAll({
      attributes: ["Department_Id", "Department_Name"],
      where: { Factory_Id: factoryId },
    });
    res.json(departmentList);
  } catch (error) {
    console.error(`Error while fetching data: ${error}`);
    res.status(500).send("Internal server error");
  }
});

// *to get all factories
departmentRoutes.get("/getAll-Factories", async (req, res) => {
  console.log(
    "=========================================== getting factories route called"
  );
  try {
    const factories = await Factory.findAll();
    if (factories) {
      console.log("factories: " + JSON.stringify(factories));
      res.status(200).json({ data: factories }); // Send factories as the response
    } else {
      res.status(404).json({ message: "No factories found" });
    }
  } catch (error) {
    console.error(error.message); // Log the error to the console
    res.status(500).json({ error: error.message }); // Respond with error details
  }
});

//to get user categories from db

module.exports = departmentRoutes;
