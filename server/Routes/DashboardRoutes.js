const express = require("express");
const dashboardRoutes = express.Router();
const { Op } = require("sequelize");
const sequelize = require("sequelize");

// Import from models/index.js - This should export all models
const db = require("../models");

// Debug: Check what models are available
console.log("Available models in db:", Object.keys(db));

// 1. Get Dashboard Summary Counts
exports.getDashboardSummary = async (req, res, next) => {
  try {
    // Get date from query params, default to today
    let selectedDate = new Date();
    if (req.query.date) {
      selectedDate = new Date(req.query.date);
    }
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if Visits model exists
    if (!db.Visits) {
      throw new Error("Visits model not found in database");
    }

    // Total visits scheduled for selected date (based on Date_From)
    const totalTodayVisits = await db.Visits.count({
      where: {
        Date_From: {
          [Op.between]: [selectedDate, nextDay],
        },
      },
    });

    // Current visits (visits that have checked in but not checked out yet)
    const currentVisits = await db.Visits.count({
      where: {
        Date_From: {
          [Op.between]: [selectedDate, nextDay],
        },
        Checkin_Time: {
          [Op.not]: null,
        },
        Checkout_Time: null,
      },
    });

    // Yet to visit (scheduled but not checked in yet)
    const yetToVisit = await db.Visits.count({
      where: {
        Date_From: {
          [Op.between]: [selectedDate, nextDay],
        },
        Checkin_Time: null,
        Checkout_Time: null,
      },
    });

    // Visits that have completed (checked in and checked out)
    const completedVisits = await db.Visits.count({
      where: {
        Date_From: {
          [Op.between]: [selectedDate, nextDay],
        },
        Checkin_Time: {
          [Op.not]: null,
        },
        Checkout_Time: {
          [Op.not]: null,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalTodayVisits,
        currentVisits,
        yetToVisit,
        completedVisits,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to get visit status
const getVisitStatus = (visit) => {
  // Check approval workflow first
  if (!visit.D_User) {
    return "User Approval Pending";
  } else if (!visit.D_Head_Approval) {
    return "Department Head Approval Pending";
  } else if (!visit.HR_Approval) {
    return "HR Approval Pending";
  } else if (!visit.Reference_No) {
    return "Reference Number Pending";
  }

  // Check visit status (checkout first, then checkin, then upcoming)
  if (visit.Checkout_Time) {
    return "Completed Visit";
  } else if (visit.Checkin_Time) {
    return "Ongoing Visit";
  } else {
    return "Upcoming Visit";
  }
};

// 2. Get Today's Visitors List
exports.getTodaysVisitors = async (req, res, next) => {
  try {
    // Get date from query params, default to today
    let selectedDate = new Date();
    if (req.query.date) {
      selectedDate = new Date(req.query.date);
    }
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get page and limit from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get search filters
    const search = req.query.search || "";
    const factoryId = req.query.factoryId;
    const departmentId = req.query.departmentId;
    const status = req.query.status; // Status filter will be applied after fetching

    // Build where clause
    const whereClause = {
      Date_From: {
        [Op.between]: [selectedDate, nextDay],
      },
    };

    // Add factory/department filter if provided
    if (factoryId) whereClause.Factory_Id = factoryId;
    if (departmentId) whereClause.Department_Id = departmentId;

    // Get visits
    const visits = await db.Visits.findAndCountAll({
      where: whereClause,
      attributes: [
        "Visit_Id",
        "Date_From",
        "Date_To",
        "Time_From",
        "Time_To",
        "Checkin_Time",
        "Checkout_Time",
        "Purpose",
        "Visitor_Category",
        "Factory_Id",
        "Department_Id",
        "ContactPerson_Id",
        "Reference_No",
        "Remark",
        "D_User",
        "D_Head_Approval",
        "HR_Approval",
        "Tea",
        "Lunch",
        "Breakfast",
      ],
      order: [
        ["Date_From", "ASC"],
        ["Time_From", "ASC"],
      ],
      limit,
      offset,
    });

    // Get additional details for each visit
    const visitsWithDetails = [];
    for (const visit of visits.rows) {
      const visitData = visit.toJSON();

      // Get contact person
      let contactPerson = null;
      if (visit.ContactPerson_Id && db.ContactPersons) {
        contactPerson = await db.ContactPersons.findByPk(
          visit.ContactPerson_Id,
          {
            attributes: [
              "ContactPerson_Name",
              "ContactPerson_ContactNo",
              "ContactPerson_Email",
              "ContactPerson_NIC",
            ],
          }
        );
      }

      // Get visitors
      let visitors = [];
      if (visit.ContactPerson_Id && db.Visitors) {
        visitors = await db.Visitors.findAll({
          where: { ContactPerson_Id: visit.ContactPerson_Id },
          attributes: ["Visitor_Name", "Visitor_NIC"],
        });
      }

      // Get vehicles
      let vehicles = [];
      if (visit.ContactPerson_Id && db.Vehicles) {
        vehicles = await db.Vehicles.findAll({
          where: { ContactPerson_Id: visit.ContactPerson_Id },
          attributes: ["Vehicle_Type", "Vehicle_No"],
        });
      }

      // Get department
      let department = null;
      if (visit.Department_Id && db.Departments) {
        department = await db.Departments.findByPk(visit.Department_Id, {
          attributes: ["Department_Name"],
        });
      }

      // Get factory - NOTE: Your file is Factory.js (singular) not Factories.js
      let factory = null;
      if (visit.Factory_Id && db.Factory) {
        factory = await db.Factory.findByPk(visit.Factory_Id, {
          attributes: ["Factory_Name", "Factory_Code"],
        });
      }

      // Get status using the helper function
      const visitStatus = getVisitStatus(visit);

      visitsWithDetails.push({
        ...visitData,
        ContactPerson: contactPerson,
        Visitors: visitors,
        Vehicles: vehicles,
        Department: department,
        Factory: factory,
        Status: visitStatus,
      });
    }

    // Filter by search term if provided
    let filteredVisits = visitsWithDetails;
    if (search) {
      filteredVisits = visitsWithDetails.filter((visit) => {
        if (!visit.ContactPerson) return false;

        const contactName = visit.ContactPerson.ContactPerson_Name || "";
        const contactPhone = visit.ContactPerson.ContactPerson_ContactNo || "";
        const contactEmail = visit.ContactPerson.ContactPerson_Email || "";
        const contactNIC = visit.ContactPerson.ContactPerson_NIC || "";
        const referenceNo = visit.Reference_No || "";

        return (
          contactName.toLowerCase().includes(search.toLowerCase()) ||
          contactPhone.includes(search) ||
          contactEmail.toLowerCase().includes(search.toLowerCase()) ||
          contactNIC.includes(search) ||
          referenceNo.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Filter by status if provided (after status is calculated)
    if (status) {
      filteredVisits = filteredVisits.filter((visit) => {
        const visitStatus = visit.Status;
        // Map status filter to actual status values
        if (status === "upcoming") {
          return visitStatus === "Upcoming Visit";
        } else if (status === "ongoing") {
          return visitStatus === "Ongoing Visit";
        } else if (status === "completed") {
          return visitStatus === "Completed Visit";
        }
        return true;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        visits: filteredVisits,
        total: filteredVisits.length,
        page,
        totalPages: Math.ceil(filteredVisits.length / limit),
      },
    });
  } catch (error) {
    console.error("Todays visitors error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Get Filter Options
exports.getFilterOptions = async (req, res, next) => {
  try {
    let factories = [];
    let departments = [];

    // Get factories - NOTE: Model name is Factory (singular)
    if (db.Factory && typeof db.Factory.findAll === "function") {
      factories = await db.Factory.findAll({
        attributes: ["Factory_Id", "Factory_Name"],
        order: [["Factory_Name", "ASC"]],
      });
    }

    // Get departments
    if (db.Departments && typeof db.Departments.findAll === "function") {
      departments = await db.Departments.findAll({
        attributes: ["Department_Id", "Department_Name", "Factory_Id"],
        order: [["Department_Name", "ASC"]],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        factories,
        departments,
      },
    });
  } catch (error) {
    console.error("Filter options error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Get Statistics for Charts
exports.getStatistics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's stats
    const todayStats = {
      upcoming: await db.Visits.count({
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Checkin_Time: null,
          Checkout_Time: null,
        },
      }),
      ongoing: await db.Visits.count({
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Checkin_Time: { [Op.not]: null },
          Checkout_Time: null,
        },
      }),
      completed: await db.Visits.count({
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Checkin_Time: { [Op.not]: null },
          Checkout_Time: { [Op.not]: null },
        },
      }),
    };

    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const visits = await db.Visits.count({
        where: {
          Date_From: {
            [Op.between]: [dayStart, dayEnd],
          },
        },
      });

      const completed = await db.Visits.count({
        where: {
          Date_From: {
            [Op.between]: [dayStart, dayEnd],
          },
          Checkin_Time: { [Op.not]: null },
          Checkout_Time: { [Op.not]: null },
        },
      });

      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        visits,
        completed,
        pending: visits - completed,
      });
    }

    // Factory distribution for today
    const factoryStats = await db.Visits.findAll({
      where: {
        Date_From: { [Op.between]: [today, tomorrow] },
      },
      attributes: [
        "Factory_Id",
        [sequelize.fn("COUNT", sequelize.col("Visit_Id")), "count"],
      ],
      group: ["Factory_Id"],
      raw: true,
    });

    // Get factory names
    const factoryData = [];
    for (const stat of factoryStats) {
      let factoryName = `Factory ${stat.Factory_Id}`;
      if (db.Factory) {
        const factory = await db.Factory.findByPk(stat.Factory_Id, {
          attributes: ["Factory_Name", "Factory_Code"],
        });
        if (factory) {
          factoryName = factory.Factory_Name;
        }
      }
      factoryData.push({
        name: factoryName,
        value: parseInt(stat.count),
      });
    }

    // Category distribution - Get counts grouped by Visitor_Category ID
    const categoryStats = await db.Visits.findAll({
      where: {
        Date_From: { [Op.between]: [today, tomorrow] },
        Visitor_Category: { [Op.not]: null },
      },
      attributes: [
        "Visitor_Category",
        [sequelize.fn("COUNT", sequelize.col("Visit_Id")), "count"],
      ],
      group: ["Visitor_Category"],
      raw: true,
    });

    // Get category names from VisitorCategory table
    const categoryData = [];
    for (const stat of categoryStats) {
      let categoryName = "Unknown";
      const categoryId = stat.Visitor_Category;

      // Fetch category name from VisitorCategory table
      if (db.VisitorCategory && categoryId) {
        try {
          const category = await db.VisitorCategory.findByPk(categoryId, {
            attributes: ["visitor_category"],
          });
          if (category && category.visitor_category) {
            categoryName = category.visitor_category;
          }
        } catch (err) {
          console.error("Error fetching category:", err);
          // If lookup fails, use the ID as fallback
          categoryName = `Category ${categoryId}`;
        }
      }

      categoryData.push({
        name: categoryName,
        value: parseInt(stat.count || 0),
      });
    }

    // Meal plan counts for today
    const breakfastCount = await db.Visits.count({
      where: {
        Date_From: { [Op.between]: [today, tomorrow] },
        Breakfast: true,
      },
      include: {
        model: db.Visitors,
        as: "Visitor",
      },
    });
    const companionBreakfastCount = await db.Visitors.count({
      include: {
        model: db.Visits,
        as: "Visit",
        required: true,
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Breakfast: true,
        },
      },
    });

    const lunchCount = await db.Visits.count({
      where: {
        Date_From: { [Op.between]: [today, tomorrow] },
        Lunch: true,
      },
      include: {
        model: db.Visitors,
        as: "Visitor",
      },
    });
    const companionLunch = await db.Visitors.count({
      include: {
        model: db.Visits,
        as: "Visit",
        required: true,
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Lunch: true,
        },
      },
    });

    const teaCount = await db.Visits.count({
      where: {
        Date_From: { [Op.between]: [today, tomorrow] },
        Tea: true,
      },
    });
    const companionTea = await db.Visitors.count({
      include: {
        model: db.Visits,
        as: "Visit",
        required: true,
        where: {
          Date_From: { [Op.between]: [today, tomorrow] },
          Tea: true,
        },
      },
    });

    const mealPlanStats = [
      { name: "Breakfast", value: breakfastCount + breakfastCount },
      { name: "Lunch", value: lunchCount + companionLunch },
      { name: "Tea", value: teaCount + companionTea },
    ];

    const hourlyData = Array.from({ length: 12 }, (_, i) => ({
      hour: `${i + 8}:00`,
      scheduled: Math.floor(Math.random() * 15) + 5,
      checkedIn: Math.floor(Math.random() * 10) + 3,
      completed: Math.floor(Math.random() * 8) + 1,
    }));

    res.status(200).json({
      success: true,
      data: {
        todayStats,
        last7Days,
        factoryStats: factoryData,
        categoryStats: categoryData,
        mealPlanStats,
        hourlyData,
      },
    });
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Quick Search
exports.quickSearch = async (req, res, next) => {
  try {
    const searchTerm = req.query.q || "";

    if (!searchTerm.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Search contact persons
    let contactPersons = [];
    if (db.ContactPersons) {
      contactPersons = await db.ContactPersons.findAll({
        where: {
          [Op.or]: [
            { ContactPerson_Name: { [Op.like]: `%${searchTerm}%` } },
            { ContactPerson_ContactNo: { [Op.like]: `%${searchTerm}%` } },
            { ContactPerson_NIC: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: 10,
        attributes: [
          "ContactPerson_Id",
          "ContactPerson_Name",
          "ContactPerson_ContactNo",
        ],
      });
    }

    const contactPersonIds = contactPersons.map((cp) => cp.ContactPerson_Id);

    // Get visits for these contact persons
    let visits = [];
    if (contactPersonIds.length > 0) {
      visits = await db.Visits.findAll({
        where: {
          ContactPerson_Id: {
            [Op.in]: contactPersonIds,
          },
        },
        limit: 10,
        order: [["Date_From", "DESC"]],
        include: [
          {
            model: db.ContactPersons,
            as: "ContactPerson",
            attributes: ["ContactPerson_Name", "ContactPerson_ContactNo"],
          },
        ],
      });
    }

    // Format results
    const results = visits.map((visit) => ({
      Visit_Id: visit.Visit_Id,
      Date_From: visit.Date_From,
      Time_From: visit.Time_From,
      Purpose: visit.Purpose,
      ContactPerson: visit.ContactPerson,
      Status: getVisitStatus(visit),
    }));

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Quick search error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUpcomingVisitors = exports.getTodaysVisitors;

// Route definitions
dashboardRoutes.get("/summary", exports.getDashboardSummary);
dashboardRoutes.get("/today", exports.getTodaysVisitors);
dashboardRoutes.get("/upcoming", exports.getUpcomingVisitors);
dashboardRoutes.get("/filters", exports.getFilterOptions);
dashboardRoutes.get("/statistics", exports.getStatistics);
dashboardRoutes.get("/search", exports.quickSearch);

module.exports = dashboardRoutes;
