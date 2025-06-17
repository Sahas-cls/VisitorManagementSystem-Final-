const express = require("express");
const { Op, where } = require("sequelize");
const { sequelize } = require("../models/index");
const visiterRoutes = express.Router();
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const exceljs = require("exceljs");
const authToken = require("../middlewares/authonticationToken");

// const sequelize = new sequelize({
//   dialect: "mysql", // Change this based on your DB type (mysql, postgres, etc.)
//   host: "localhost", // Your DB host
//   username: "root", // Your DB username
//   password: "", // Your DB password
//   database: "db_vm_sys", // Your DB name
// });

const {
  ContactPersons,
  Visitors,
  Visits,
  Vehicles,
  Departments,
  department_Users,
  VisitorCategory,
  VisitingPurpose,
} = require("../models");
const Factory = require("../models/Factory");
const sendEmail = require("../utils/SendEmail");
const findUsers = require("../utils/getUsers");

//to provide all visitors details according to client side request
visiterRoutes.get("/", csrfProtection, (req, res) => {
  console.log(req.csrfToken());
  return res.status(200).send("All visitors: " + req.csrfToken());
});

// to provide all visitor categories
visiterRoutes.get("/getVisitor-categories", async (req, res) => {
  try {
    const vCategories = await VisitorCategory.findAll();
    if (vCategories) {
      console.log(vCategories);
      return res.status(200).json({ success: true, data: vCategories });
    }
  } catch (error) {
    console.error("error while fetching visitor categories: ", error);
    const updateVisit = {
      Department_Id: Requested_Department,
      Date_From: Date_From,
      Requested_Officer: Requested_Officer,
      Visitor_Category: Visitor_Category,
      Purpose: Purpose,
      Date_To: Date_To,
      Time_From: Time_From,
      Time_To: Time_To,
      Breakfast: Breakfast || null,
      Lunch: Lunch || null,
      Tea: Tea || null,
      Num_of_Days: Num_of_Days,
      Remark: Remark,
      Last_Modified_By: userId,
    };
    return res.status(500).json({ success: false, data: "" });
  }
});

visiterRoutes.get(
  "/getVisiting_purpose/:visiting_category",
  async (req, res) => {
    const visiting_category = req.params.visiting_category;
    console.log(visiting_category);

    try {
      const vPurpose = await VisitingPurpose.findAll({
        where: {
          visitor_category_id: visiting_category,
        },
      });

      if (vPurpose) {
        return res.status(200).json({ success: true, data: vPurpose });
      }
    } catch (error) {
      console.error("Error while fetching the visiting purposes: ", error);
      return res.status(500).json({ success: true, data: "" });
    }
  }
);

//get visitor details according to department id
visiterRoutes.get("/getVisitors/:departmentId", async (req, res) => {
  const departmentId = req.params.departmentId;
  console.log("Route called");
  console.log("Received Parameters:", req.params);

  try {
    const visitList = await Visits.findAll({
      // attributes: [
      //   'Visit_Id', // Include Visit_Id if you need it
      //   'Date_From', // Visiting Date
      //   [sequelize.col('Visitor.Visitor_Name'), 'Visitor_Name'], // Visitor_Name from the Visitor table
      //   [sequelize.col('Visitor.Visitor_NIC'), 'Visitor_NIC'], // Visitor_NIC from the Visitor table
      // ],
      include: [
        {
          model: Visitors, // Include the Visitors model
          as: "Visitor", // The alias you defined in your association
          attributes: [
            "Visitor_Id",
            "Visitor_Name",
            "Visitor_NIC",
            "Contact_No",
          ], // No need to fetch extra attributes from the Visitors model here
        },
      ],
      where: {
        [Op.and]: [{ D_Head_Approval: false }, { Department_Id: departmentId }],
      },
    });

    // Log the result to make sure it's correct
    // console.log("Found visit list with visitor data:", visitList.map(v => v.toJSON()));

    res.status(201).json({ data: visitList });
  } catch (error) {
    console.error("Error while fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

  console.log(req.params);
});

//getting data for department head form getVisitors-dhead
visiterRoutes.get("/getVisitors-dhead", async (req, res) => {
  console.log("get all called");
  //taking sended parameters to const
  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  // userFactoryId: userFactoryId, console.log("dep id: ", depId);

  // const { Op, sequelize } = require("sequelize");

  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Alias for Visits
        where: {
          [Op.and]: [{ Department_Id: depId }, { Factory_Id: facId }],
          D_Head_Approval: false,
          Date_From: {
            [Op.gte]: sequelize.fn("CURDATE"), // Filter for today
          },
          Requested_Officer: {
            [Op.ne]: null,
            [Op.ne]: "",
          },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Alias for Vehicles
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors",
        required: true,
      },
    ],
  });

  // Log or return the result

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

// Validation middleware for the request body
const validateFormData = [
  // Contact Person Details Validation
  body("contactPersonDetails.cEmail")
    .isEmail()
    .withMessage("Invalid email format.")
    .normalizeEmail(),

  body("contactPersonDetails.cMobileNo")
    .isMobilePhone()
    .withMessage("Invalid mobile number format.")
    .isLength({ min: 10, max: 15 })
    .matches(/^[0-9]{10,12}$/)
    .withMessage("Invalid Mobile number."),

  body("contactPersonDetails.cNIC")
    .matches(/^\d{9}[vV]$|^\d{12}$/)
    .withMessage("Invalid NIC Number"),

  body("contactPersonDetails.cName")
    .notEmpty()
    .withMessage("Contact person name is required.")
    .isString()
    .withMessage("Name must be a string."),

  // Date and Time Validation
  body("dateTimeDetails.dateFrom")
    .isISO8601()
    .withMessage("Invalid date format for dateFrom.")
    .toDate(),

  body("dateTimeDetails.fTimeFrom")
    .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage("Invalid time format for fTimeFrom (HH:mm)."),

  body("dateTimeDetails.fTimeTo")
    .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .withMessage("Invalid time format for fTimeTo (HH:mm)."),

  // Department Details Validation
  body("departmentDetails.department")
    .isNumeric()
    .withMessage("Department id required."),

  body("departmentDetails.factory")
    .isString()
    .withMessage("Factory should be a string."),

  // Vehicle Details Validation (Array of vehicles)
  body("vehicleDetails.*.VehicleNo")
    .notEmpty()
    .withMessage("Vehicle number is required.")
    .isString()
    .withMessage("Vehicle number must be a string."),

  body("vehicleDetails.*.VehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required.")
    .isString()
    .withMessage("Vehicle type must be a string."),

  // Visitor Details Validation (Array of visitors)
  body("visitorDetails.*.visitorName")
    .notEmpty()
    .withMessage("Visitor name is required.")
    .isString()
    .withMessage("Visitor name must be a string."),

  body("visitorDetails.*.visitorNIC")
    .matches(/^\d{9}[vV]$|^\d{12}$/)
    .withMessage("Invalid visitor NIC number123"),

  body("factory")
    .notEmpty()
    .withMessage("Please select a factory that you would like to visit"),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() }); // Return the error response
    }
    // Only call next() if there are no errors
    next;
  },
];

// To take visitor details
visiterRoutes.get(
  "/getVisitors/:visitorId",
  [
    //adding validations
  ],
  async (req, res) => {
    console.log("requesting visitor data");
    console.log(req.params);
    // Implement logic to get visitor details by visitorId
  }
);

// To register a new visitor to db
// visiterRoutes.post(
//   "/registration",
//   csrfProtection,
//   [
//     // Contact Person Details Validation
//     body("contactPersonDetails.cEmail")
//       .optional({ checkFalsy: true }) // Skip validation if value is not provided or is an empty string
//       .isEmail()
//       .withMessage("Invalid email format."),

//     body("contactPersonDetails.cMobileNo")
//       .isMobilePhone()
//       .withMessage("Invalid mobile number format.")
//       .isLength({ min: 10, max: 15 })
//       .withMessage("Mobile number must be between 10 and 15 digits."),

//     body("contactPersonDetails.cNIC")
//       .matches(/^\d{9}[vV]$|^\d{12}$/)
//       .withMessage("ContactPerson NIC number is invalid."),

//     body("contactPersonDetails.cName")
//       .notEmpty()
//       .withMessage("Contact person name is required.")
//       .isString()
//       .withMessage("Name must be a string."),

//     // Date and Time Validation
//     body("dateTimeDetails.dateFrom")
//       .isISO8601()
//       .withMessage("Invalid date format for dateFrom.")
//       .toDate(),

//     body("dateTimeDetails.fTimeFrom")
//       .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
//       .withMessage("Invalid time format for fTimeFrom (HH:mm)."),

//     body("dateTimeDetails.fTimeTo")
//       .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
//       .withMessage("Invalid time format for fTimeTo (HH:mm)."),

//     body("dateTimeDetails.dateTo")
//       .optional()
//       .isISO8601()
//       .withMessage("Invalid date format for dateTo.")
//       .toDate(),

//     // Department Details Validation
//     body("departmentDetails.department")
//       .isNumeric()
//       .withMessage("Please select a department."),

//     body("departmentDetails.factory")
//       .isNumeric()
//       .withMessage("Please select a factory.")
//       .bail()
//       .notEmpty()
//       .withMessage("Please select a factory."),

//     // Vehicle Details Validation (Array of vehicles)
//     body("vehicleDetails.*.VehicleNo")
//       .optional({ checkFalsy: true })
//       .isString()
//       .withMessage("Vehicle number must be a string."),

//     body("vehicleDetails.*.VehicleType")
//       .optional({ checkFalsy: true })
//       .isString()
//       .withMessage("Vehicle type must be a string."),

//     // Visitor Details Validation (Array of visitors)
//     body("visitorDetails.*.visitorName")
//       .optional({ checkFalsy: true })
//       .isLength({ min: 3, max: 255 })
//       .withMessage("Visitor name must be between 3 and 255 characters.")
//       .isString()
//       .withMessage("Name can only contain letters."),

//     body("visitorDetails.*.visitorNIC")
//       .optional({ checkFalsy: true })
//       .matches(/^\d{9}[vV]$|^\d{12}$/)
//       .withMessage("Invalid visitor NIC number format."),

//     // body("visitorDetails.*.Visitor_NIC")
//     //   // .optional({ checkFalsy: true })
//     //   .custom((value) => {
//     //     const valid = /^\d{9}[vV]$|^\d{12}$/.test(value);
//     //     if (!valid) {
//     //       throw new Error(
//     //         `Invalid NIC: "${value}". Must be 9 digits + v/V or 12 digits.`
//     //       );
//     //     }
//     //     return true;
//     //   }),
//   ],

//   async (req, res) => {
//     console.log(req.body);
//     // Handle validation errors
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       console.log(errors);
//       return res.status(400).json({ errors: errors.array() }); // Return the error response
//     }

//     console.log("Visitor registration route called");
//     // console.log("Request body: ", req.body);

//     // Collecting form data from the request
//     const {
//       contactPersonDetails,
//       departmentDetails,
//       dateTimeDetails,
//       vehicleDetails = [], // Default to empty array if undefined
//       visitorDetails = [], // Default to empty array if undefined
//     } = req.body;

//     // Initialize transaction
//     const transaction = await sequelize.transaction();

//     try {
//       // Contact Person creation
//       const newContactPerson = {
//         ContactPerson_Name: contactPersonDetails.cName,
//         ContactPerson_NIC: contactPersonDetails.cNIC,
//         ContactPerson_ContactNo: contactPersonDetails.cMobileNo,
//         ContactPerson_Email: contactPersonDetails.cEmail,
//       };

//       const cPerson = await ContactPersons.create(newContactPerson, {
//         transaction,
//       });
//       if (!cPerson) {
//         console.log("Contact person creation failed");
//         throw new Error("Contact person creation failed");
//       }

//       const ContactPersonId = cPerson.ContactPerson_Id;
//       console.log("Contact person details: ", ContactPersonId);

//       // Create visitors
//       if (Array.isArray(visitorDetails) && visitorDetails.length > 0) {
//         for (let visitor of visitorDetails) {
//           if (visitor && visitor.visitorNIC && visitor.visitorName) {
//             // Ensure visitor is not null and has required fields
//             let newVisitor = {
//               ContactPerson_Id: ContactPersonId,
//               Visitor_Name: visitor.visitorName,
//               Visitor_NIC: visitor.visitorNIC,
//             };

//             try {
//               const createdVisitor = await Visitors.create(newVisitor, {
//                 transaction,
//               });
//               console.log("Created visitor: ", createdVisitor.Visitor_Name);
//             } catch (error) {
//               if (error instanceof sequelize.ValidationError) {
//                 console.error("Validation errors:", error.errors);
//               } else {
//                 console.error("Unexpected error:", error);
//               }
//             }
//           } else {
//             console.warn("Incomplete or null visitor details:", visitor);
//           }
//         }
//       } else {
//         console.warn("No visitor details provided or invalid format.");
//       }

//       // Create vehicles
//       if (Array.isArray(vehicleDetails) && vehicleDetails.length > 0) {
//         for (let vehicle of vehicleDetails) {
//           if (vehicle && vehicle.VehicleNo && vehicle.VehicleType) {
//             let newVehicle = {
//               ContactPerson_Id: ContactPersonId,
//               Vehicle_No: vehicle.VehicleNo,
//               Vehicle_Type: vehicle.VehicleType,
//             };

//             const createdVehicle = await Vehicles.create(newVehicle, {
//               transaction,
//             });
//             console.log("Created vehicle: ", createdVehicle.Vehicle_No);
//           }
//         }
//       } else {
//         console.warn("No vehicle data provided in this record.");
//       }

//       // Create a visit for the above details
//       const dateFrom = new Date(dateTimeDetails.dateFrom);
//       const dateTo = dateTimeDetails.dateTo
//         ? new Date(dateTimeDetails.dateTo)
//         : null;
//       const noOfDays = dateTo
//         ? Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24))
//         : 1; // Default to 1 day if dateTo is not provided

//       let newVisit = {
//         ContactPerson_Id: ContactPersonId,
//         Department_Id: departmentDetails.department,
//         Date_From: dateTimeDetails.dateFrom,
//         Date_To: dateTimeDetails.dateTo || dateTimeDetails.dateFrom,
//         Time_From: dateTimeDetails.fTimeFrom,
//         Time_To: dateTimeDetails.fTimeTo,
//         Num_of_Days: noOfDays,
//         Factory_Id: departmentDetails.factory,
//       };

//       const createdVisit = await Visits.create(newVisit, { transaction });
//       console.log("Visit created successfully");

//       // Commit transaction if all operations succeed
//       await transaction.commit();

//       //this function from util file => getUsers.js
//       const listOfEmails = await findUsers(
//         departmentDetails.factory,
//         departmentDetails.department
//       );

//       console.log(listOfEmails);
//       // return;

//       //this function from util file => sendEmail.js
//       const info = await sendEmail(
//         listOfEmails,
//         "New visitor arrival",
//         `<p>${contactPersonDetails.cName} is waiting for the approval</p>`
//       );

//       // console.log(info);

//       if (info.success === true) {
//         console.log("Email sent success");
//       } else {
//         console.log("Email sent failed");
//       }

//       // Respond with success
//       res.status(200).json({
//         success: true,
//         message: "Registration and visit creation success",
//         email: info.success,
//       });
//     } catch (error) {
//       console.log("Error occurred: ", error);

//       // Rollback transaction if any operation fails
//       await transaction.rollback();

//       // Return failure response
//       res.status(500).json({
//         success: false,
//         message: "Registration failed",
//         error: error.message,
//       });
//     }
//   }
// );

//new and faster query to register new visitors
visiterRoutes.post(
  "/registration",
  [
    //     // Contact Person Details Validation
    body("contactPersonDetails.cEmail")
      .optional({ checkFalsy: true }) // Skip validation if value is not provided or is an empty string
      .isEmail()
      .withMessage("Invalid email format."),

    body("contactPersonDetails.cMobileNo")
      .isMobilePhone()
      .withMessage("Invalid mobile number format.")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits."),

    body("contactPersonDetails.cNIC")
      .matches(/^\d{9}[vV]$|^\d{12}$/)
      .withMessage("ContactPerson NIC number is invalid."),

    body("contactPersonDetails.cName")
      .notEmpty()
      .withMessage("Contact person name is required.")
      .isString()
      .withMessage("Name must be a string."),

    //     // Date and Time Validation
    body("dateTimeDetails.dateFrom")
      .isISO8601()
      .withMessage("Invalid date format for dateFrom.")
      .toDate(),

    body("dateTimeDetails.fTimeFrom")
      .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
      .withMessage("Invalid time format for fTimeFrom (HH:mm)."),

    body("dateTimeDetails.fTimeTo")
      .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
      .withMessage("Invalid time format for fTimeTo (HH:mm)."),

    body("dateTimeDetails.dateTo")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format for dateTo.")
      .toDate(),

    //     // Department Details Validation
    body("departmentDetails.department")
      .isNumeric()
      .withMessage("Please select a department."),

    body("departmentDetails.factory")
      .isNumeric()
      .withMessage("Please select a factory.")
      .bail()
      .notEmpty()
      .withMessage("Please select a factory."),

    //     // Vehicle Details Validation (Array of vehicles)
    body("vehicleDetails.*.VehicleNo")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Vehicle number must be a string."),

    body("vehicleDetails.*.VehicleType")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Vehicle type must be a string."),

    //     // Visitor Details Validation (Array of visitors)
    body("visitorDetails.*.visitorName")
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 255 })
      .withMessage("Visitor name must be between 3 and 255 characters.")
      .isString()
      .withMessage("Name can only contain letters."),

    body("visitorDetails.*.visitorNIC")
      .optional({ checkFalsy: true })
      .matches(/^\d{9}[vV]$|^\d{12}$/)
      .withMessage("Invalid visitor NIC number format."),

    //     // body("visitorDetails.*.Visitor_NIC")
    //     //   // .optional({ checkFalsy: true })
    //     //   .custom((value) => {
    //     //     const valid = /^\d{9}[vV]$|^\d{12}$/.test(value);
    //     //     if (!valid) {
    //     //       throw new Error(
    //     //         `Invalid NIC: "${value}". Must be 9 digits + v/V or 12 digits.`
    //     //       );
    //     //     }
    //     //     return true;
    //     //   }),
  ],
  csrfProtection,
  [
    // Validation middleware (same as yours, keep this part unchanged)
  ],
  async (req, res) => {
    // console.time("TotalRouteTime");
    // console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      contactPersonDetails,
      departmentDetails,
      dateTimeDetails,
      vehicleDetails = [],
      visitorDetails = [],
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
      console.time("CreateContactPerson");

      // Step 1: Create Contact Person
      const cPerson = await ContactPersons.create(
        {
          ContactPerson_Name: contactPersonDetails.cName,
          ContactPerson_NIC: contactPersonDetails.cNIC,
          ContactPerson_ContactNo: contactPersonDetails.cMobileNo,
          ContactPerson_Email: contactPersonDetails.cEmail,
        },
        { transaction }
      );

      console.timeEnd("CreateContactPerson");
      const ContactPersonId = cPerson.ContactPerson_Id;

      // Step 2: Create Visitors (in parallel)
      console.time("CreateVisitors");

      const validVisitors = visitorDetails.filter(
        (v) => v && v.visitorNIC && v.visitorName
      );

      await Promise.all(
        validVisitors.map((visitor) =>
          Visitors.create(
            {
              ContactPerson_Id: ContactPersonId,
              Visitor_Name: visitor.visitorName,
              Visitor_NIC: visitor.visitorNIC,
            },
            { transaction }
          )
        )
      );

      console.timeEnd("CreateVisitors");

      // Step 3: Create Vehicles (in parallel)
      console.time("CreateVehicles");

      const validVehicles = vehicleDetails.filter(
        (v) => v && v.VehicleNo && v.VehicleType
      );

      await Promise.all(
        validVehicles.map((vehicle) =>
          Vehicles.create(
            {
              ContactPerson_Id: ContactPersonId,
              Vehicle_No: vehicle.VehicleNo,
              Vehicle_Type: vehicle.VehicleType,
            },
            { transaction }
          )
        )
      );

      console.timeEnd("CreateVehicles");

      // Step 4: Create Visit
      console.time("CreateVisit");

      const dateFrom = new Date(dateTimeDetails.dateFrom);
      const dateTo = dateTimeDetails.dateTo
        ? new Date(dateTimeDetails.dateTo)
        : null;
      const noOfDays = dateTo
        ? Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24))
        : 1;

      await Visits.create(
        {
          ContactPerson_Id: ContactPersonId,
          Department_Id: departmentDetails.department,
          Factory_Id: departmentDetails.factory,
          Date_From: dateTimeDetails.dateFrom,
          Date_To: dateTimeDetails.dateTo || dateTimeDetails.dateFrom,
          Time_From: dateTimeDetails.fTimeFrom,
          Time_To: dateTimeDetails.fTimeTo,
          Num_of_Days: noOfDays,
        },
        { transaction }
      );

      console.timeEnd("CreateVisit");

      // Step 5: Commit DB operations
      await transaction.commit();

      // Respond immediately
      res.status(200).json({
        success: true,
        message: "Visitor registered successfully",
      });

      console.time("FindUsers");
      const listOfEmails = await findUsers(
        departmentDetails.factory,
        departmentDetails.department
      );
      console.timeEnd("FindUsers");

      // Send Email (does NOT block the response)
      console.time("SendEmail");
      const info = await sendEmail(
        listOfEmails,
        "New visitor arrival",
        `<p>${contactPersonDetails.cName} is waiting for approval</p>`
      );
      console.timeEnd("SendEmail");

      console.log("Email sent:", info.success);
      console.timeEnd("TotalRouteTime");
    } catch (error) {
      console.error("Error occurred:", error);
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

//to get all department name and id to display on department combobox
visiterRoutes.get("/getDepartments", async (req, res) => {
  try {
    const allDepartments = await Departments.findAll({
      attributes: ["Department_Id", "Department_Name"],
    });
    if (allDepartments) {
      // console.log(allDepartments);
      return res.status(200).json({ data: allDepartments });
    } else {
      return res.status(500);
    }
  } catch (error) {}
});

visiterRoutes.get("/getDepartments/:factoryId", async (req, res) => {
  const factoryId = req.params.factoryId || 0;
  // console.log("fac id ============ " + factoryId);
  // return
  try {
    const allDepartments = await Departments.findAll({
      attributes: ["Department_Id", "Department_Name"],
      where: {
        Factory_Id: factoryId,
      },
    });
    if (allDepartments) {
      // console.log(allDepartments);
      // console.log("departments, ", allDepartments);
      return res.status(200).json({ data: allDepartments });
    } else {
      return res.status(500);
    }
  } catch (error) {}
});

//to get all the visitors details according to the department
visiterRoutes.get("/getDepartmentVisitors", authToken, async (req, res) => {
  console.log("get all called");
  //taking sended parameters to const
  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  // const { Op, sequelize } = require("sequelize");
  //
  // console.log(depId, facId);
  // console.log(req);
  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: facId }, { Department_Id: depId }],
          D_Head_Approval: false,
          Date_From: {
            [Op.gte]: sequelize.fn("CURDATE"), // Filter for today
          },
          Requested_Officer: {
            [Op.or]: [{ [Op.is]: null }, { [Op.eq]: "" }],
          },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  // Log or return the result

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

//to update exisiting visitor using department clerk dashboard
visiterRoutes.post(
  "/updateVisitor",
  authToken,
  [
    // Entry_Request Validation
    body("Entry_Request.Requested_Department")
      .isNumeric()
      .withMessage("Requested Department must be a number."),
    body("Entry_Request.Requested_Officer")
      .notEmpty()
      .withMessage("Requested Officer is required.")
      .isString()
      .withMessage("Requested Officer must be a string."),
    body("Entry_Request.Visitor_Category")
      .notEmpty()
      .withMessage("Visitor Category is required.")
      .isString()
      .withMessage("Visitor Category must be a string."),

    // Entry_Permit Validation
    body("Entry_Permit.Purpose")
      .notEmpty()
      .withMessage("Purpose is required.")
      .isString()
      .withMessage("Purpose must be a string."),

    // Person Validation
    body("Person.Remark")
      .optional()
      .isString()
      .withMessage("Remark must be a string value."),
  ],
  async (req, res) => {
    // Handle validation errors
    // const { userId } = req.body.userId;

    console.log(req.body);
    // return;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();
    console.log("req body", req.body);

    const { user_Data } = req.body;

    const {
      Requested_Department,
      Date_From,
      Requested_Officer,
      Visitor_Category,
    } = req.body.Entry_Request;

    console.log("======================", user_Data, "====================");
    // return;

    const { userId, userName, userFactoryId, userDepartmentId } = user_Data;
    const { Purpose, Date_To, Time_From, Time_To } = req.body.Entry_Permit;
    const { Breakfast, Lunch, Tea, Remark } = req.body.Person;
    const Visit_Id = req.body.Visit_Id;

    // Check if Visit_Id is provided
    if (!Visit_Id) {
      return res.status(400).send("Visit_Id is required.");
    }

    console.log("Breakfast " + Breakfast);

    // Validation: Check if Date_To is later than Date_From
    let Num_of_Days = 1;
    if (Date_From && Date_To) {
      const dateFrom = new Date(Date_From);
      const dateTo = new Date(Date_To);

      if (dateTo < dateFrom) {
        return res
          .status(400)
          .send("Date_To cannot be earlier than Date_From.");
      }

      Num_of_Days = Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24));
    }

    const updateVisit = {
      Department_Id: Requested_Department,
      Date_From: Date_From,
      Requested_Officer: Requested_Officer,
      Visitor_Category: Visitor_Category,
      Purpose: Purpose,
      Date_To: Date_To,
      Time_From: Time_From,
      Time_To: Time_To,
      Breakfast: Breakfast || false,
      Lunch: Lunch || false,
      Tea: Tea || false,
      Num_of_Days: Num_of_Days,
      Remark: Remark,
      Last_Modified_By: userId,
    };

    try {
      // Check if the Visit exists in the database
      const selectedVisit = await Visits.findOne({
        where: { Visit_Id: Visit_Id },
      });

      if (!selectedVisit) {
        return res.status(404).send("Visit not found.");
      }

      // Proceed with updating the visit
      const updatedVisit = await selectedVisit.update(updateVisit, {
        transaction,
      });

      // If update is successful, commit the transaction
      if (updatedVisit) {
        await transaction.commit();
        console.log("Update success...");

        // sending email to department head
        try {
          console.log(
            `=============factory id: ${userFactoryId} department Id: ${userDepartmentId}==========`
          );
          const usersList = await department_Users.findAll({
            where: {
              factory_Id: userFactoryId,
              department_Id: userDepartmentId,
              user_category: "Department Head",
            },
          });

          // console.log("user list ===== ", usersList);

          let emailAddresses = "";

          if (usersList && usersList.length > 0) {
            emailAddresses = usersList
              .map((user) => user.dataValues.user_email)
              .join(",");
            console.log(emailAddresses);

            sendEmail(
              emailAddresses,
              "New Visitor Approval Required",
              `
                <h3>Hi</h3>
                <p>A new visitor request is pending your approval.</p>
                <p>Please log into the visitor management system to approve or decline the request</p>
                <a href="http://localhost:5173" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Go to the Application</a>
                <br>
                <br>
                <p>Thank you,</p>
                <p>Visitor Management System</p>
              `
            );
          } else {
            console.log("Cannot find users");
          }
        } catch (error) {
          console.error(error);
        }

        return res.status(200).send("Visit Update success");
      } else {
        // Rollback the transaction if the update fails
        await transaction.rollback();
        return res.status(500).send("Internal server error");
      }
    } catch (error) {
      // Rollback in case of any error
      await transaction.rollback();
      console.error(error.message);
      return res.status(500).send("Visitor update failed, please try again");
    }
  }
);

//to update data in department head dashboard
visiterRoutes.post(
  "/updateVisitor-dhead",
  authToken,
  [
    // Entry_Request Validation
    body("Entry_Request.Requested_Department")
      .isNumeric()
      .withMessage("Please select requested department."),
    body("Entry_Request.Requested_Officer")
      .notEmpty()
      .withMessage("Requested Officer is required.")
      .bail()
      .isString()
      .withMessage("Requested Officer name cannot have numerics."),
    body("Entry_Request.Visitor_Category")
      .notEmpty()
      .withMessage("Visitor Category is required."),

    // Entry_Permit Validation
    body("Entry_Permit.Purpose").notEmpty().withMessage("Purpose is required."),

    // Person Validation
    body("Person.Remark").optional(),
  ],
  async (req, res) => {
    // Handle validation errors
    const userId = req.body.userId;
    // console.log("user id ======================== : ", userId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();
    console.log("req body", req.body);

    const { userData } = req.body;
    // console.log("==============", userData, "====================");
    // return;
    const { userName, userFactoryId, userDepartmentId } = userData;

    const {
      Requested_Department,
      Date_From,
      Requested_Officer,
      Visitor_Category,
    } = req.body.Entry_Request;

    const { Purpose, Date_To, Time_From, Time_To } = req.body.Entry_Permit;
    const { Breakfast, Lunch, Tea, Remark } = req.body.Person;
    const Visit_Id = req.body.Visit_Id;

    // Check if Visit_Id is provided
    if (!Visit_Id) {
      return res.status(400).send("Visit_Id is required.");
    }

    // console.log("Breakfast " + Breakfast);

    // Validation: Check if Date_To is later than Date_From
    let Num_of_Days = 1;
    if (Date_From && Date_To) {
      const dateFrom = new Date(Date_From);
      const dateTo = new Date(Date_To);

      if (dateTo < dateFrom) {
        return res
          .status(400)
          .send("Date_To cannot be earlier than Date_From.");
      }

      Num_of_Days = Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24));
    }

    const updateVisit = {
      Department_Id: Requested_Department,
      Date_From: Date_From,
      Requested_Officer: Requested_Officer,
      Visitor_Category: Visitor_Category,
      Purpose: Purpose,
      Date_To: Date_To,
      Time_From: Time_From,
      Time_To: Time_To,
      Breakfast: Breakfast || false,
      Lunch: Lunch || false,
      Tea: Tea || false,
      Num_of_Days: Num_of_Days,
      Remark: Remark,
      D_Head_Approval: true,
      D_Approved_By: userId,
      Last_Modified_By: userId,
    };

    try {
      // Check if the Visit exists in the database
      const selectedVisit = await Visits.findOne({
        where: { Visit_Id: Visit_Id },
      });

      if (!selectedVisit) {
        return res.status(404).send("Visit not found.");
      }

      // Proceed with updating the visit
      const updatedVisit = await selectedVisit.update(updateVisit, {
        transaction,
      });

      // If update is successful, commit the transaction
      if (updatedVisit) {
        await transaction.commit();
        console.log("Update success...");

        try {
          // console.log(
          //   `=============factory id: ${userFactoryId} department Id: ${userDepartmentId}==========`
          // );
          const usersList = await department_Users.findAll({
            where: {
              factory_Id: userFactoryId,
              user_category: "HR User",
            },
          });

          // console.log("user list ===== ", usersList);

          let emailAddresses = "";

          if (usersList && usersList.length > 0) {
            emailAddresses = usersList
              .map((user) => user.dataValues.user_email)
              .join(",");
            console.log(emailAddresses);

            sendEmail(
              emailAddresses,
              "New Visitor Approval Required",
              `
                <h3>Hi</h3>
                <p>A new visitor has been registered</p>
                <p>Please log into the visitor management system to review the details.</p>
                <a href="http://localhost:5173" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Go to the Application</a>
                <br>
                <p>Thank you,</p>
                <p>Visitor Management System</p>
              `
            );
          } else {
            console.log("Cannot find users");
          }
        } catch (error) {
          console.error(error);
        }

        return res.status(200).send("Visit Update success");
      } else {
        // Rollback the transaction if the update fails
        await transaction.rollback();
        return res.status(500).send("Internal server error");
      }
    } catch (error) {
      // Rollback in case of any error
      await transaction.rollback();
      console.error(error.message);
      return res.status(500).send("Visitor update failed, please try again");
    }
  }
);

//to fetch => hr user
visiterRoutes.get("/getVisitors-hr", async (req, res) => {
  console.log("get all called");
  console.log(req.query);
  //taking sended parameters to const
  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  // const { Op, sequelize } = require("sequelize");
  //
  // console.log(depId, facId);
  // console.log(req);
  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Alias as per the model association
        where: {
          [Op.and]: [
            { Factory_Id: facId },
            { HR_Approval: false },
            { Date_From: { [Op.gte]: sequelize.fn("CURDATE") } }, // Filter for today
          ],
        },
        required: true,
        include: [
          {
            model: Departments,
            as: "Departments", // Alias as per the model association
            required: true,
            where: sequelize.literal(`(
              Department_Name = 'Common' OR (Department_Name != 'common' AND D_Head_Approval = true)
            )`),
          },
        ],
      },
      {
        model: Vehicles,
        as: "Vehicles",
        required: false,
      },
      {
        model: Visitors,
        as: "Visitors",
        required: false,
      },
    ],
  });

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

// updating specific visit usign hr user account
visiterRoutes.post(
  "/updateVisitor-hr",
  authToken,
  [
    // Entry_Request Validation
    body("Entry_Request.Requested_Department")
      .isNumeric()
      .withMessage("Requested Department must be a number."),
    body("Entry_Request.Requested_Officer")
      .notEmpty()
      .withMessage("Requested Officer is required.")
      .isString()
      .withMessage("Requested Officer must be a string."),
    body("Entry_Request.Visitor_Category")
      .notEmpty()
      .withMessage("Visitor Category is required.")
      .isString()
      .withMessage("Visitor Category must be a string."),

    // Entry_Permit Validation
    body("Entry_Permit.Purpose")
      .notEmpty()
      .withMessage("Purpose is required.")
      .isString()
      .withMessage("Purpose must be a string."),

    // Person Validation
    body("Person.Remark")
      .optional()
      .isString()
      .withMessage("Remark must be a string value."),
  ],
  async (req, res) => {
    // Handle validation errors
    const userId = req.body.userId;
    // console.log("user id ======================== : ", userId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await sequelize.transaction();
    console.log("req body", req.body);

    const {
      Requested_Department,
      Date_From,
      Requested_Officer,
      Visitor_Category,
    } = req.body.Entry_Request;

    const { Purpose, Date_To, Time_From, Time_To } = req.body.Entry_Permit;
    const { Breakfast, Lunch, Tea, Remark } = req.body.Person;
    const Visit_Id = req.body.Visit_Id;

    // Check if Visit_Id is provided
    if (!Visit_Id) {
      return res.status(400).send("Visit_Id is required.");
    }

    // console.log("Breakfast " + Breakfast);

    // Validation: Check if Date_To is later than Date_From
    let Num_of_Days = 1;
    if (Date_From && Date_To) {
      const dateFrom = new Date(Date_From);
      const dateTo = new Date(Date_To);

      if (dateTo < dateFrom) {
        return res
          .status(400)
          .send("Date_To cannot be earlier than Date_From.");
      }

      Num_of_Days = Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24));
    }

    const { UserData } = req.body;
    const { userName, userFactoryId, userDepartmentId } = UserData;

    const updateVisit = {
      HR_Approval: true,
      H_Approved_By: userId,
      Requested_Officer: Requested_Officer,
      Purpose: Purpose,
      Visitor_Category: Visitor_Category,
      Breakfast: Breakfast || false,
      Lunch: Lunch || false,
      Tea: Tea || false,
      Remark: Remark,

      // Last_Modified_By: userId,
    };

    try {
      // Check if the Visit exists in the database
      const selectedVisit = await Visits.findOne({
        where: { Visit_Id: Visit_Id },
      });

      if (!selectedVisit) {
        return res.status(404).send("Visit not found.");
      }

      // Proceed with updating the visit
      const updatedVisit = await selectedVisit.update(updateVisit, {
        transaction,
      });

      // If update is successful, commit the transaction
      if (updatedVisit) {
        await transaction.commit();
        console.log("Update success...");

        try {
          // console.log(
          //   `=============factory id: ${userFactoryId} department Id: ${userDepartmentId}==========`
          // );
          const usersList = await department_Users.findAll({
            where: {
              factory_Id: userFactoryId,
              user_category: "Reception",
            },
          });

          // console.log("user list ===== ", usersList);

          let emailAddresses = "";

          if (usersList && usersList.length > 0) {
            emailAddresses = usersList
              .map((user) => user.dataValues.user_email)
              .join(",");
            console.log(emailAddresses);

            sendEmail(
              emailAddresses,
              "New Visitor BOI pass required",
              `
                <h3>Hi</h3>
                <p>A new visitor has been registerd.</p>
                <p>Please log intothe visitor management system and arrange a BOI pass for him</p>
                <a href="http://localhost:5173" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Go to the Application</a>
                <p>Thank you,</p>
                <p>Visitor Management System</p>
              `
            );
          } else {
            console.log("Cannot find users, email send failed");
          }
        } catch (error) {
          console.error(error);
        }

        return res.status(200).send("Visit Update success");
      } else {
        // Rollback the transaction if the update fails
        await transaction.rollback();
        return res.status(500).send("Internal server error");
      }
    } catch (error) {
      // Rollback in case of any error
      await transaction.rollback();
      console.error(error.message);
      return res.status(500).send("Visitor update failed, please try again");
    }
  }
);

//fetching data for display reception
visiterRoutes.get("/getVisitors-reception", async (req, res) => {
  console.log("request body: " + req.body);
  // return
  console.log("get all called");
  console.log(req.query);
  //taking sended parameters to const
  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  // const { Op, sequelize } = require("sequelize");
  //
  // console.log(depId, facId);
  // console.log(req);
  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: facId }],
          // D_Head_Approval: true,
          HR_Approval: true,
          Date_From: {
            [Op.gte]: sequelize.fn("CURDATE"), // Filter for today
          },

          [Op.or]: [
            { Reference_No: "" }, // Empty string
            { Reference_No: null }, // Null value
          ],
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  // Log or return the result

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

// update visit from reception dashboard
visiterRoutes.post("/updateVisitors-reception", async (req, res) => {
  // console.log(req.body);
  const visit_Id = req.body.Visit_Id;
  const { refNumber, issuedDate } = req.body.Reference_Details;
  // console.log(req.body.Reference_Details);
  // console.log("====================================================");
  // console.log(`visitId ${visit_Id}, refNumber ${refNumber}`);
  try {
    const visit = await Visits.findOne({
      where: {
        Visit_Id: visit_Id,
      },
    });

    if (visit) {
      const updatedVisit = visit.update({
        Reference_No: refNumber,
        Issued_Date: issuedDate,
      });

      if (updatedVisit) {
        return res.status(200).json({ msg: "Update success" });
      }
    }
  } catch (error) {}
});
//create contact person details using contactPersondetails->req

// Route for sudden visits
visiterRoutes.post(
  "/createSuddenvisit",
  // Direct validation in route
  body("entryRequest.reqDept")
    .notEmpty()
    .withMessage("Please select a department"),

  body("entryRequest.reqDate")
    .notEmpty()
    .withMessage("Please select a date")
    .isDate()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("You cannot select past dates");
      }
      return true;
    }),

  body("entryRequest.reqOfficer")
    .notEmpty()
    .withMessage("Officer name required")
    .bail()
    .matches(/^[A-Za-z\s]{3,255}$/)
    .withMessage("Invalid name format"),

  body("entryRequest.visitorCategory")
    .notEmpty()
    .withMessage("Please select a visitor category"),

  body("entryPermit.purpose")
    .notEmpty()
    .withMessage("Please select visit purpose"),

  body("entryPermit.dateFrom")
    .notEmpty()
    .withMessage("Please select a from date")
    .isDate()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Past dates for "from" date');
      }
      return true;
    }),

  body("entryPermit.dateTo")
    .notEmpty()
    .withMessage("Please select a to date")
    .isDate()
    .withMessage("Invalid date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.entryPermit.dateFrom)) {
        throw new Error('Past dates for "to" date');
      }
      return true;
    }),

  body("entryPermit.timeFrom")
    .notEmpty()
    .withMessage("Please select time when the visit started")
    .isString()
    .withMessage("Invalid time format"),

  body("entryPermit.timeTo")
    .optional() // Only validate if timeTo is provided
    .custom((value, { req }) => {
      if (
        value &&
        new Date(`1970-01-01T${value}:00Z`) <=
          new Date(`1970-01-01T${req.body.entryPermit.timeFrom}:00Z`)
      ) {
        throw new Error("Time cannot be in past");
      }
      return true;
    }),

  body("visitorsData.*.visitorName")
    .notEmpty()
    .withMessage("Visitor name required")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should only contain letters and spaces"),

  body("visitorsData.*.visitorNIC")
    .notEmpty()
    .withMessage("Visitor NIC required")
    .matches(/^[0-9]{9}[vV]$|^[0-9]{12}$/)
    .withMessage("Invalid NIC format"),

  body("mealplan.aditionalNote")
    .optional()
    .isString()
    .withMessage("Invalid remark option"),

  // Validation handler to check and send errors
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed with the request
    console.log("Route called ============================================");
    console.log(req.body);
    // return;
    const {
      userFactoryId,
      entryRequest,
      entryPermit,
      visitorsData,
      mealplan = [], // Default to empty array if undefined
      // visitorDetails = [], // Default to empty array if undefined
    } = req.body;

    // Initialize transaction
    const transaction = await sequelize.transaction();

    try {
      // Contact Person creation
      const newContactPerson = {
        ContactPerson_Name: visitorsData[0].visitorName,
        ContactPerson_NIC: visitorsData[0].visitorNIC,
        ContactPerson_ContactNo: "0761234567",
        ContactPerson_Email: "examplecontactperson@gmail.com",
      };

      const cPerson = await ContactPersons.create(newContactPerson, {
        transaction,
      });
      if (!cPerson) {
        console.log("Contact person creation failed");
        throw new Error("Contact person creation failed");
      }

      const ContactPersonId = cPerson.ContactPerson_Id;
      console.log("Contact person details: ", ContactPersonId);

      // Create visitors
      if (Array.isArray(visitorsData) && visitorsData.length > 1) {
        for (let visitor of visitorsData) {
          if (visitor && visitor.visitorNIC && visitor.visitorName) {
            // Ensure visitor is not null and has required fields
            let newVisitor = {
              ContactPerson_Id: ContactPersonId,
              Visitor_Name: visitor.visitorName,
              Visitor_NIC: visitor.visitorNIC,
            };

            try {
              const createdVisitor = await Visitors.create(newVisitor, {
                transaction,
              });
              console.log("Created visitor: ", createdVisitor.Visitor_Name);
            } catch (error) {
              if (error instanceof sequelize.ValidationError) {
                console.error("Validation errors:", error.errors);
              } else {
                console.error("Unexpected error:", error);
              }
            }
          } else {
            console.warn("Incomplete or null visitor details:", visitor);
          }
        }
      } else {
        console.warn("No visitor details provided or invalid format.");
      }

      // Create vehicles

      // Create a visit for the above details
      const dateFrom = new Date(entryPermit.dateFrom);
      const dateTo = entryPermit.dateTo ? new Date(entryRequest.dateTo) : null;
      const noOfDays = dateTo
        ? Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24))
        : 1; // Default to 1 day if dateTo is not provided

      const breakfast = mealplan.breakfast === "on" ? true : false;
      const lunch = mealplan.lunch === "on" ? true : false;
      const tea = mealplan.tea === "on" ? true : false;

      let newVisit = {
        Factory_Id: userFactoryId.userFactoryId,
        ContactPerson_Id: ContactPersonId,
        Department_Id: entryRequest.reqDept,
        Date_From: entryPermit.dateFrom,
        Date_To: entryPermit.dateTo,
        Time_From: entryPermit.timeFrom,
        Time_To: entryPermit.timeTo,
        Num_of_Days: noOfDays,
        Factory_Id: userFactoryId.userFactoryId,
        Breakfast: breakfast || null,
        Lunch: lunch || null,
        Purpose: entryPermit.purpose,
        Visitor_Category: entryRequest.visitorCategory,
        Tea: tea || null,
        Remark: mealplan.additionalNote,
      };

      const createdVisit = await Visits.create(newVisit, { transaction });
      console.log("Visit created successfully");

      // Commit transaction if all operations succeed
      await transaction.commit();

      // Respond with success
      res.status(200).json({
        success: true,
        message: "Registration and visit creation success",
      });
    } catch (error) {
      console.log("Error occurred: ", error);

      // Rollback transaction if any operation fails
      await transaction.rollback();

      // Return failure response
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }

    // res.status(200).json({ message: "Sudden visit created successfully" });
  }
);

// to send email - reception
visiterRoutes.post(
  "/sendEmail",
  csrfProtection,
  [
    body("formData.userId").notEmpty().withMessage("User id cannot be null"),

    body("formData.Visit_Id").notEmpty().withMessage("Visit id cannot be null"),

    body("formData.Reference_Details.refNumber")
      .notEmpty()
      .withMessage("Please enter reference number"),

    body("formData.Reference_Details.issuedDate")
      .notEmpty()
      .withMessage("Please select issued date")
      .bail()
      .isDate()
      .withMessage("Issued date format incorrect"),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, visit_Id } = req.body.formData;
    const { refNumber, issuedDate } = req.body.formData.Reference_Details;
    const { contactPersonEmail } = req.body;

    try {
      sendEmail(
        contactPersonEmail,
        "Your visit was approved",
        `
        <h1>Your entry has been successfully registered, and the reference number for your visit is:</h1>
        <p style="color:blue">${refNumber}</p>
        <p>Please use this reference number when entering the BOI gate</p>
        <p>Should you need any further assistance, feel free to contact us.</p>
        <p>We look forward to welcoming you soon!</p>
        <br><br>

        Best regards,
        Receptionist
        Guston Group
        `
      );

      return res.status(200).json({ msg: "Email sent success full" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Email doesn't sent" });
    }
  }
);

//visitor details for today - date
visiterRoutes.get(
  "/getDepartmentVisitors-securityVisitor",
  async (req, res) => {
    console.log(req.body);
    const depId = req.query.userDepartmentId;
    const facId = req.query.userFactoryId;
    console.log(depId, "", facId);
    // return;
    // const { Op, sequelize } = require("sequelize");

    // Assuming the user provides Date_From and Date_To in the query
    const Date_From = req.query.Date_From; // Example: 25
    const Date_To = req.query.Date_To; // Example: 30

    try {
      const result = await ContactPersons.findAll({
        include: [
          {
            model: Visits,
            as: "Visits",
            where: {
              HR_Approval: true,
              [Op.and]: [
                { Reference_No: { [Op.ne]: null } },
                { Reference_No: { [Op.ne]: "" } },
              ],
               [Op.and]: [
                 // Ensure the current date falls within the given Date_From and Date_To
                 sequelize.where(
                   sequelize.fn("DATE", sequelize.col("Visits.Date_From")),
                   {
                     [Op.lte]: sequelize.fn("CURDATE"),
                   }
                 ),
                 sequelize.where(
                   sequelize.fn("DATE", sequelize.col("Visits.Date_To")),
                   {
                     [Op.gte]: sequelize.fn("CURDATE"),
                   }
                 ),
                 // You can add further constraints based on the factory and department IDs if needed
                 { Factory_Id: facId },
               ],
            },
            required: true,
          },
          {
            model: Vehicles,
            as: "Vehicles",
            required: false,
          },
          {
            model: Visitors,
            as: "Visitors",
            required: false,
          },
        ],
      });

      if (result && result.length > 0) {
        return res.status(200).json({ data: result });
      } else {
        console.log("doesn't have visitors yet");
        return res
          .status(200)
          .json({ msg: "No visitors found for the given date range." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Failed to fetch data", error });
    }
  }
);

visiterRoutes.get(
  "/getDepartmentVisitors-securityVisitor/:findByName",
  async (req, res) => {
    const findByName = req.params.findByName;
    console.log(findByName);
    // return;
    console.log(req.body);
    const depId = req.query.userDepartmentId;
    const facId = req.query.userFactoryId;
    console.log(depId, "", facId);
    // return;
    // const { Op, sequelize } = require("sequelize");

    // Assuming the user provides Date_From and Date_To in the query
    const Date_From = req.query.Date_From; // Example: 25
    const Date_To = req.query.Date_To; // Example: 30

    try {
      const result = await ContactPersons.findAll({
        where: {
          ContactPerson_Name: {
            [Op.like]: `%${findByName}%`,
          },
        },
        include: [
          {
            model: Visits,
            as: "Visits",
            where: {
              HR_Approval: true,
              [Op.and]: [
                { Reference_No: { [Op.ne]: null } },
                { Reference_No: { [Op.ne]: "" } },
              ],
              // [Op.and]: [
              //   // Ensure the current date falls within the given Date_From and Date_To
              //   sequelize.where(
              //     sequelize.fn("DATE", sequelize.col("Visits.Date_From")),
              //     {
              //       [Op.lte]: sequelize.fn("CURDATE"),
              //     }
              //   ),
              //   sequelize.where(
              //     sequelize.fn("DATE", sequelize.col("Visits.Date_To")),
              //     {
              //       [Op.gte]: sequelize.fn("CURDATE"),
              //     }
              //   ),
              //   // You can add further constraints based on the factory and department IDs if needed
              //   { Factory_Id: facId },
              //   { Department_Id: depId },
              // ],
            },
            required: true,
          },
          {
            model: Vehicles,
            as: "Vehicles",
            required: false,
          },
          {
            model: Visitors,
            as: "Visitors",
            required: false,
          },
        ],
      });

      if (result && result.length > 0) {
        return res.status(200).json({ data: result });
      } else {
        console.log("doesn't have visitors yet");
        return res
          .status(200)
          .json({ msg: "No visitors found for the given date range." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Failed to fetch data", error });
    }
  }
);

// update checkin checkout time in security officer dashboard

// if (Visit_Id !== "") {
//   try {
//     const selectedVisit = await Visits.findOne({
//       where: { Visit_Id: Visit_Id },
//     });

//     const isoDate = new Date(currentDate).toISOString();),
//     if (selectedVisit) {
//       const updateVisit = await selectedVisit.update({
//       });
//       if (updateVisit) {
//         console.log(currentDate, "=====================");
//         return res.status(200).json({ msg: "Visit update success" });
//       } else {
//         return res.status(400).json({ msg: "Update failed" });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// visiterRoutes.post("/updateChackIn", async (req, res) => {
//   // console.log(req.body);
//   const { currentDate, visit } = req.body;
//   const { Visit_Id } = visit;

//   if (Visit_Id !== "") {
//     try {
//       const selectedVisit = await Visits.findOne({
//         where: { Visit_Id: Visit_Id },
//       });

//       // Convert currentDate to system local time zone using JavaScript Date object
//       const localDate = new Date(); // This will use the system's local time zone

//       if (selectedVisit) {
//         // Update Checkin_Time with the local date
//         const updateVisit = await selectedVisit.update({
//           Checkin_Time: localDate,
//         });

//         if (updateVisit) {
//           console.log(localDate, "====================="); // Log the local date
//           return res.status(200).json({ msg: "Visit update success" });
//         } else {
//           return res.status(400).json({ msg: "Update failed" });
//         }
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ msg: "Internal server error" });
//     }
//   } else {
//     return res.status(400).json({ msg: "Invalid Visit_Id" });
//   }
// });

visiterRoutes.post("/updateChackIn", async (req, res) => {
  const { currentDate, visit } = req.body;
  const { Visit_Id } = visit;

  if (!Visit_Id || Visit_Id === "") {
    return res.status(400).json({ msg: "Invalid Visit_Id" });
  }

  try {
    const selectedVisit = await Visits.findOne({
      where: { Visit_Id: Visit_Id },
    });

    if (!selectedVisit) {
      return res.status(404).json({ msg: "Visit not found" });
    }

    // Use the provided ISO date string directly
    const providedDate = new Date(currentDate);

    if (isNaN(providedDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format" });
    }

    const updateVisit = await selectedVisit.update({
      Checkin_Time: providedDate,
    });

    console.log(providedDate, "====================="); // Log the parsed date

    return res.status(200).json({ msg: "Visit update success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

visiterRoutes.post("/updateChackOut", async (req, res) => {
  const { currentDate, visit } = req.body;
  const { Visit_Id } = visit;

  if (!Visit_Id || Visit_Id === "") {
    return res.status(400).json({ msg: "Invalid Visit_Id" });
  }

  try {
    const selectedVisit = await Visits.findOne({
      where: { Visit_Id: Visit_Id },
    });

    if (!selectedVisit) {
      return res.status(404).json({ msg: "Visit not found" });
    }

    const providedDate = new Date(currentDate);

    if (isNaN(providedDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date format" });
    }

    // Update Checkout_Time with provided date
    const updateVisit = await selectedVisit.update({
      Checkout_Time: providedDate,
    });

    console.log(providedDate, "====================="); // Log the parsed date

    const { Checkin_Time, Checkout_Time } = updateVisit;

    if (Checkin_Time && Checkout_Time) {
      const checkinTime = new Date(Checkin_Time);
      const checkoutTime = new Date(Checkout_Time);

      const timeDifference = checkoutTime - checkinTime;

      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      console.log(
        `Total time spent: ${hours} hours, ${minutes} minutes, ${seconds} seconds`
      );

      const totalTimeString = `${hours} hours, ${minutes} minutes`;
      await updateVisit.update({
        Total_Time: totalTimeString,
      });

      return res.status(200).json({
        msg: "Visit update success",
      });
    } else {
      console.log("Check-in time is empty, total time not calculated");
      return res.status(400).json({
        msg: "Check-in or check-out time is missing",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

// to collect edited visitor list by Department User
visiterRoutes.get("/selectEditedVisitors-CUser", async (req, res) => {
  // console.log("get all called");

  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  const userId = req.query.userId;

  // console.log(`${depId} === ${facId}`);
  // return;
  const oneWeekAgo = sequelize.fn(
    "DATE_SUB",
    sequelize.fn("CURDATE"),
    sequelize.literal("INTERVAL 7 DAY")
  );

  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: facId }, { Department_Id: depId }],
          Last_Modified_By: userId,
          // updatedAt: {
          //   [Op.between]: [oneWeekAgo, sequelize.fn("CURDATE")], // Filter for records from the last week
          // },
          Requested_Officer: {
            [Op.or]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
          },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

visiterRoutes.get("/selectApprovedVisitors-DHead", async (req, res) => {
  // console.log("get all called");

  console.log(req.query);

  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  const userId = req.query.userId;
  console.log(depId + " " + facId + " " + userId);
  // return

  // console.log(`${depId} === ${facId}`);
  // return;
  const oneWeekAgo = sequelize.fn(
    "DATE_SUB",
    sequelize.fn("CURDATE"),
    sequelize.literal("INTERVAL 7 DAY")
  );

  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: facId }, { Department_Id: depId }],
          Last_Modified_By: userId,
          // updatedAt: {
          //   [Op.between]: [oneWeekAgo, sequelize.fn("CURDATE")], // Filter for records from the last week
          // },
          Requested_Officer: {
            [Op.or]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
          },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

visiterRoutes.get("/approvedVisitors-Hr", async (req, res) => {
  console.log("get all called");
  console.log(req.query);
  //taking sended parameters to const
  // const depId = req.query.userDepartmentId;
  // const facId = req.query.userFactoryId;
  // const userId = req.query.userId;
  const { userDepartmentId, userFactoryId, userId } = req.query;
  // console.log(userId);return;
  // const { Op, sequelize } = require("sequelize");
  //
  // console.log(depId, facId);
  // console.log(`${depId}, " ", ${facId}, " ", ${userId} `);
  // return;
  const oneWeekAgo = sequelize.fn(
    "DATE_SUB",
    sequelize.fn("CURDATE"),
    sequelize.literal("INTERVAL 7 DAY")
  );
  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: userFactoryId }],
          HR_Approval: true,
          H_Approved_By: userId,
          // updatedAt: {
          //   [Op.between]: [oneWeekAgo, sequelize.fn("CURDATE")], // Filter for records from the last week
          // },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  // Log or return the result

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

// to generate excel report
visiterRoutes.post(
  "/generateExcelRepo",
  csrfProtection,
  [
    body("dateFrom")
      .notEmpty()
      .withMessage("Please select Date From before generating the report"),
    body("dateTo")
      .notEmpty()
      .withMessage("Please select Date To before generating the report"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors);
      return res.status(400).send(errors.array());
    }

    const { dateFrom, dateTo } = req.body;

    try {
      const visitors = await Visits.findAll({
        where: {
          Date_From: { [Op.between]: [dateFrom, dateTo] },
          Checkin_Time: { [Op.ne]: null },
        },
        include: [
          {
            model: ContactPersons,
            as: "ContactPerson",
            required: true,
          },
          {
            model: Departments,
            as: "Departments",
            required: true,
          },
        ],
      });

      if (visitors) {
        const workBook = new exceljs.Workbook();
        const worksheet = workBook.addWorksheet(`${dateFrom} - ${dateTo}`);

        const headerRow = worksheet.addRow([
          "Date",
          "Name",
          "NIC",
          "Req Department",
          "Check in",
          "Check out",
          "Total Time Spend",
          "Reference No",
        ]);

        headerRow.font = { bold: true, size: 14 };
        headerRow.alignment = { horizontal: "center", vertical: "middle" };

        for (let i = 1; i <= 9; i++) {
          headerRow.getCell(i).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4F81BD" },
          };
        }

        // Helper to format datetime
        const formatDateTime = (dt) =>
          dt
            ? new Date(dt).toLocaleString("en-GB", {
                timeZone: "Asia/Colombo",
              })
            : "";

        visitors.forEach((visit) => {
          worksheet.addRow([
            new Date(visit.Date_From).toLocaleDateString("en-GB"),
            visit.ContactPerson.ContactPerson_Name,
            visit.ContactPerson.ContactPerson_NIC,
            visit.Departments.Department_Name,
            formatDateTime(visit.Checkin_Time),
            formatDateTime(visit.Checkout_Time),
            visit.Total_Time,
            visit.Reference_No,
          ]);
        });

        // Column widths
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 25;
        worksheet.getColumn(3).width = 15;
        worksheet.getColumn(4).width = 20;
        worksheet.getColumn(5).width = 25;
        worksheet.getColumn(6).width = 25;
        worksheet.getColumn(7).width = 25;
        worksheet.getColumn(8).width = 20;
        worksheet.getColumn(9).width = 20;

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Visitor_Report.xlsx"'
        );

        await workBook.xlsx.write(res);
        res.end();
      }
    } catch (error) {
      console.error("Excel generation error:", error);
      res.status(500).send("Error generating Excel file");
    }
  }
);

// to delete a record
visiterRoutes.delete(
  "/delete-visit-dUser/:cPerson_Id",
  csrfProtection,
  authToken,
  async (req, res) => {
    const cPerson_Id = req.params.cPerson_Id || null;

    if (cPerson_Id) {
      const transaction = await sequelize.transaction(); // Start the transaction

      try {
        // Deleting related visit
        const delete_visit = await Visits.destroy({
          where: {
            ContactPerson_Id: cPerson_Id,
          },
        });

        if (delete_visit === 0) {
          console.log("visit delete failed");
          // throw new Error("visit delete failed");
        }

        // Deleting related Visitors
        const delete_visitors = await Visitors.destroy({
          where: {
            ContactPerson_Id: cPerson_Id,
          },
          transaction, // Pass the transaction
        });

        if (delete_visitors === 0) {
          // Check if no rows were deleted
          console.log(
            "Visitors delete failed or may don't have any visitors with contact person"
          );
          // throw new Error("Visitors delete failed");
        }

        // Deleting related Vehicles
        const delete_vehicles = await Vehicles.destroy({
          where: {
            ContactPerson_Id: cPerson_Id,
          },
          transaction, // Pass the transaction
        });

        if (delete_vehicles === 0) {
          // Check if no rows were deleted
          console.log("Vehicle deletion failed or may them don't have vehicle");
          // throw new Error("Vehicle delete failed");
        }

        // Deleting ContactPerson record
        const delete_contactP = await ContactPersons.destroy({
          where: {
            ContactPerson_Id: cPerson_Id,
          },
          transaction, // Pass the transaction
        });

        if (delete_contactP === 0) {
          // Check if no rows were deleted
          console.log("Contact person delete failed");
          throw new Error("Contact person delete failed");
        }

        // If all deletions are successful, commit the transaction
        await transaction.commit();
        return res
          .status(200)
          .json({ msg: "All records deleted successfully" });
      } catch (error) {
        // Rollback if any operation fails
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ err: error.message || error });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Invalid or missing contact person ID" });
    }
  }
);

// update visit --> reception
visiterRoutes.post(
  "/updatevisit-reception",
  csrfProtection,
  [
    // Contact Person Details Validation
    body("contactPerson.cEmail")
      .optional({ checkFalsy: true }) // Skip validation if value is not provided or is an empty string
      .isEmail()
      .withMessage("Invalid email format."),

    body("contactPerson.cMobileNo")
      .isMobilePhone()
      .withMessage("Invalid mobile number format.")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 and 15 digits."),

    body("contactPerson.cNIC")
      .matches(/^\d{9}[vV]$|^\d{12}$/)
      .withMessage("ContactPerson NIC number is invalid."),

    body("contactPerson.cName")
      .notEmpty()
      .withMessage("Contact person name is required.")
      .isString()
      .withMessage("Name must be a string."),

    // Date and Time Validation
    body("visitingDateTime.dateFrom")
      .isISO8601()
      .withMessage("Invalid date format for dateFrom.")
      .toDate(),

    body("visitingDateTime.fTimeFrom")
      .notEmpty()
      .withMessage("Please select time that would you like to visit"),
    // .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
    // .withMessage("Invalid time format for fTimeFrom (HH:mm)."),

    // body("visitingDateTime.fTimeTo")

    // .matches(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
    // .withMessage("Invalid time format for fTimeTo (HH:mm)."),

    body("visitingDateTime.dateTo")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format for dateTo.")
      .toDate(),
    // =================================================================== //
    // Department Details Validation
    // body("visitorDetails.department")
    //   .isNumeric()
    //   .withMessage("Please select a department."),

    // body("visitorDetails.factory")
    //   .isNumeric()
    //   .withMessage("Please select a factory.")
    //   .notEmpty()
    //   .withMessage("Please select a factory."),

    // Vehicle Details Validation (Array of vehicles)
    body("vehicleDetails.*.Vehicle_No")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Vehicle number must be a string."),

    body("vehicleDetails.*.Vehicle_Type")
      .optional({ checkFalsy: true })
      .isString()
      .withMessage("Vehicle type must be a string."),

    // Visitor Details Validation (Array of visitors)
    body("visitorDetails.*.Visitor_Name")
      .optional({ checkFalsy: true })
      .isLength({ min: 3, max: 255 })
      .withMessage("Visitor name must be between 3 and 255 characters.")
      .isString()
      .withMessage("Name can only contain letters."),

    body("visitorDetails.*.Visitor_NIC")
      .optional({ checkFalsy: true })
      .custom((value) => {
        const valid = /^\d{9}[vV]$|^\d{12}$/.test(value);
        if (!valid) {
          throw new Error(
            `Invalid NIC: "${value}". Must be 9 digits + v/V or 12 digits.`
          );
        }
        return true;
      }),
  ],

  async (req, res) => {
    console.log("Edit visit route called");

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      visitId,
      contactPerson,
      visitingDateTime,
      vehicleDetails = [],
      visitorDetails = [],
      deletedVehicles = [],
      deletedVisitors = [],
    } = req.body;

    // Initialize transaction
    const transaction = await sequelize.transaction();

    try {
      // 1. Update the contact person
      const contactPersonUpdateData = {
        ContactPerson_Name: contactPerson.cName,
        ContactPerson_NIC: contactPerson.cNIC,
        ContactPerson_ContactNo: contactPerson.cMobileNo,
        ContactPerson_Email: contactPerson.cEmail,
      };

      await ContactPersons.update(contactPersonUpdateData, {
        where: { ContactPerson_Id: contactPerson.cId },
        transaction,
      });

      // 2. Calculate number of days
      const dateFrom = new Date(visitingDateTime.dateFrom);
      const dateTo = visitingDateTime.dateTo
        ? new Date(visitingDateTime.dateTo)
        : null;
      const noOfDays = dateTo
        ? Math.ceil((dateTo - dateFrom) / (1000 * 3600 * 24))
        : 1;

      // 3. Update the visit record
      if (visitId) {
        const visitUpdateData = {
          Date_From: visitingDateTime.dateFrom,
          Date_To: visitingDateTime.dateTo || visitingDateTime.dateFrom,
          Time_From: visitingDateTime.fTimeFrom,
          Time_To: visitingDateTime.fTimeTo,
          Num_of_Days: noOfDays,
        };

        await Visits.update(visitUpdateData, {
          where: { Visit_Id: visitId },
          transaction,
        });
      }

      // 4. Handle visitors - update existing and create new
      if (Array.isArray(visitorDetails)) {
        for (const visitor of visitorDetails) {
          if (visitor.Visitor_Id) {
            // Update existing visitor
            await Visitors.update(
              {
                Visitor_Name: visitor.Visitor_Name,
                Visitor_NIC: visitor.Visitor_NIC,
              },
              {
                where: { Visitor_Id: visitor.Visitor_Id },
                transaction,
              }
            );
          } else {
            // Create new visitor
            await Visitors.create(
              {
                ContactPerson_Id: contactPerson.cId,
                Visitor_Name: visitor.Visitor_Name,
                Visitor_NIC: visitor.Visitor_NIC,
              },
              { transaction }
            );
          }
        }
      }

      // 5. Delete removed visitors
      if (Array.isArray(deletedVisitors) && deletedVisitors.length > 0) {
        await Visitors.destroy({
          where: { Visitor_Id: deletedVisitors },
          transaction,
        });
      }

      // 6. Handle vehicles - update existing and create new
      if (Array.isArray(vehicleDetails)) {
        for (const vehicle of vehicleDetails) {
          if (vehicle.Vehicle_Id) {
            // Update existing vehicle
            await Vehicles.update(
              {
                Vehicle_No: vehicle.Vehicle_No,
                Vehicle_Type: vehicle.Vehicle_Type,
              },
              {
                where: { Vehicle_Id: vehicle.Vehicle_Id },
                transaction,
              }
            );
          } else {
            // Create new vehicle
            await Vehicles.create(
              {
                ContactPerson_Id: contactPerson.cId,
                Vehicle_No: vehicle.Vehicle_No,
                Vehicle_Type: vehicle.Vehicle_Type,
              },
              { transaction }
            );
          }
        }
      }

      // 7. Delete removed vehicles
      if (Array.isArray(deletedVehicles) && deletedVehicles.length > 0) {
        await Vehicles.destroy({
          where: { Vehicle_Id: deletedVehicles },
          transaction,
        });
      }

      // Commit transaction if all operations succeed
      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Visit updated successfully",
      });
    } catch (error) {
      console.error("Error in edit visit route:", error);

      // Rollback transaction if any operation fails
      await transaction.rollback();

      res.status(500).json({
        success: false,
        message: "Failed to update visit",
        error: error.message,
      });
    }
  }
);

//to get all department name and id to display on department combobox
visiterRoutes.get("/getDepartments", async (req, res) => {
  try {
    const allDepartments = await Departments.findAll({
      attributes: ["Department_Id", "Department_Name"],
    });
    if (allDepartments) {
      // console.log(allDepartments);
      return res.status(200).json({ data: allDepartments });
    } else {
      return res.status(500);
    }
  } catch (error) {}
});

visiterRoutes.get("/getDepartments/:factoryId", async (req, res) => {
  const factoryId = req.params.factoryId || 0;
  // console.log("fac id ============ " + factoryId);
  // return
  try {
    const allDepartments = await Departments.findAll({
      attributes: ["Department_Id", "Department_Name"],
      where: {
        Factory_Id: factoryId,
      },
    });
    if (allDepartments) {
      // console.log(allDepartments);
      // console.log("departments, ", allDepartments);
      return res.status(200).json({ data: allDepartments });
    } else {
      return res.status(500);
    }
  } catch (error) {}
});

//to get all the visitors details according to the department
visiterRoutes.get("/getDepartmentVisitors", async (req, res) => {
  console.log("get all called");
  //taking sended parameters to const
  const depId = req.query.userDepartmentId;
  const facId = req.query.userFactoryId;
  // const { Op, sequelize } = require("sequelize");
  //
  // console.log(depId, facId);
  // console.log(req);
  const result = await ContactPersons.findAll({
    include: [
      {
        model: Visits,
        as: "Visits", // Ensure this alias matches your model association
        where: {
          [Op.and]: [{ Factory_Id: facId }, { Department_Id: depId }],
          D_Head_Approval: false,
          Date_From: {
            [Op.gte]: sequelize.fn("CURDATE"), // Filter for today
          },
          Requested_Officer: {
            [Op.or]: [{ [Op.is]: null }, { [Op.eq]: "" }],
          },
        },
        required: true, // Ensures an INNER JOIN
      },
      {
        model: Vehicles,
        as: "Vehicles", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
      {
        model: Visitors,
        as: "Visitors", // Ensure this alias matches your model association
        required: false, // Ensures an INNER JOIN
      },
    ],
  });

  // Log or return the result

  if (result) {
    // console.log(result);
    return res.status(200).json({ data: result });
  } else {
    console.log("Invalid query");
    return res.status(500).json({ msg: "Failed to fetch data" });
  }
});

visiterRoutes.post("/undoCheckIn", async (req, res) => {
  console.log("undo check in function called");
  // console.log(req.body);
  const { visit } = req.body;
  console.log("visitId", visit);
  try {
    const result = await Visits.update(
      {
        Checkin_Time: null,
      },
      {
        where: {
          Visit_Id: visit,
        },
      }
    );

    if (result) {
      return res
        .status(200)
        .json({ statsu: true, message: "Check in time update success" });
    }
  } catch (error) {}
});

visiterRoutes.post("/undoCheckOut", async (req, res) => {
  const { Visit_Id } = req.body;
  console.log("undo check out called");
  console.log(req.body);

  if (!Visit_Id) {
    return res
      .status(400)
      .json({ status: false, message: "Visit_Id is required" });
  }

  try {
    const result = await Visits.update(
      { Checkout_Time: null },
      { where: { Visit_Id } }
    );

    if (result[0] === 1) {
      return res.status(200).json({
        status: true,
        message: "Check-out time successfully reset",
      });
    } else {
      console.log("Visit not found or already updated");
      return res.status(404).json({
        status: false,
        message: "Visit not found or already updated",
      });
    }
  } catch (error) {
    console.error("Undo check-out error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error during undo operation",
    });
  }
});

module.exports = visiterRoutes;
