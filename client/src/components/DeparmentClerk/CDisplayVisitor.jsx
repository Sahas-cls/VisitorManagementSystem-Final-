import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../Header";
import axios from "axios";
import { FaPersonCircleExclamation, FaCircleCheck } from "react-icons/fa6";
import { useFormik } from "formik";
import * as yup from "yup";
import swal from "sweetalert2";
import { motion } from "framer-motion";
import { BsExclamationCircle } from "react-icons/bs";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const CDisplayVisitor = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [visitorData, setVisitorData] = useState(null);

  // Get user data from localStorage
  const UserData = JSON.parse(localStorage.getItem("userData")) || {
    userName: "",
    userCategory: "",
    userDepartment: "",
    userDepartmentId: "",
    userFactoryId: "",
  };

  // Destructuring data from fetched state
  const Visitor = visitorData;
  const visitorGroup = visitorData?.Visitors || [];
  const Vehicles = visitorData?.Vehicles || [];
  const Visits = visitorData?.Visits?.[0] || {};
  const VisitId = Visits?.Visit_Id || visitId;

  const [apNames, setApNames] = useState({
    departmentUser: "",
    departmentHead: "",
    hrUser: "",
  });

  const [serverErrors, setServerErrors] = useState({ type: "", msg: "" });
  const [successMessages, setSuccessMessages] = useState({ type: "", msg: "" });
  const [departmentList, setDepartmentList] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorCategory, setVisitorCategory] = useState([]);
  const [visitorPurposes, setVisitorPurposes] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch single visit data
  const fetchVisitData = async () => {
    if (!visitId) {
      navigate(-1);
      return;
    }

    setIsDataLoading(true);
    try {
      // Add user department and factory IDs to query params
      const response = await axios.get(
        `${apiUrl}/visitor/getSingleVisit/${visitId}`,
        {
          params: {
            userDepartmentId: UserData.userDepartmentId,
            userFactoryId: UserData.userFactoryId,
          },
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        const fetchedData = response.data.data;
        setVisitorData(fetchedData);

        // Update form values with new data
        const visitsData = fetchedData?.Visits?.[0];
        const reqDate = visitsData?.Date_From
          ? new Date(visitsData.Date_From).toISOString().split("T")[0]
          : "";
        const dateFrom = visitsData?.Date_From
          ? new Date(visitsData.Date_From).toISOString().split("T")[0]
          : "";
        const dateTo = visitsData?.Date_To
          ? new Date(visitsData.Date_To).toISOString().split("T")[0]
          : "";

        formik.setValues({
          Requested_Department: visitsData?.Department_Id || "",
          Visitor_Category: visitsData?.Visitor_Category || "",
          Requested_Officer: visitsData?.Requested_Officer || "",
          Purpose: visitsData?.Purpose || "",
          Date_From: dateFrom || "",
          Req_Date: reqDate || "",
          Date_To: dateTo || "",
          Time_From: visitsData?.Time_From || "",
          Time_To: visitsData?.Time_To || "",
          Breakfast: visitsData?.Breakfast || false,
          Lunch: visitsData?.Lunch || false,
          Tea: visitsData?.Tea || false,
          Remark: visitsData?.Remark || "",
        });

        // Fetch visitor purposes if category exists
        if (visitsData?.Visitor_Category) {
          getVisitingPurpose(visitsData.Visitor_Category);
        }

        // Clear success message after 3 seconds
        if (successMessages.msg) {
          setTimeout(() => {
            setSuccessMessages({ type: "", msg: "" });
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error fetching visit data:", error);
      if (error.response?.status === 404) {
        swal
          .fire({
            title: "Visit Not Found",
            text: "This visit may have been deleted or you don't have permission to access it.",
            icon: "warning",
            confirmButtonText: "OK",
          })
          .then(() => {
            navigate(-1);
          });
      } else {
        setErrorMessages("Failed to load visit data. Please try again.");
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  // Fetch approved persons names
  useEffect(() => {
    if (!Visits?.Visit_Id || !csrfToken) return;

    const getUserName = async (uId) => {
      if (!uId) return null;
      try {
        const res = await axios.get(`${apiUrl}/user/getUserName/${uId}`, {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        return res.data.userName;
      } catch (error) {
        console.error("Error fetching user name:", error);
        return "Unknown";
      }
    };

    const fetchAllNames = async () => {
      const [deptUser, deptHead, hrUser] = await Promise.all([
        getUserName(Visits?.D_User),
        getUserName(Visits?.D_Approved_By),
        getUserName(Visits?.H_Approved_By),
      ]);

      setApNames({
        departmentUser: deptUser,
        departmentHead: deptHead,
        hrUser: hrUser,
      });
    };

    fetchAllNames();
  }, [Visits, csrfToken, refreshCount]);

  // Format dates
  const reqDate = Visits?.Date_From
    ? new Date(Visits.Date_From).toISOString().split("T")[0]
    : "";
  const dateTo = Visits?.Date_To
    ? new Date(Visits.Date_To).toISOString().split("T")[0]
    : "";
  const dateFrom = Visits?.Date_From
    ? new Date(Visits.Date_From).toISOString().split("T")[0]
    : "";
  const today = new Date().toISOString().split("T")[0];

  // Check if editing is disabled - UPDATED: Check D_User instead of D_Head_Approval
  const isDisabled =
    dateFrom < today || Visits?.D_User !== null || Visits?.HR_Approval;

  // Validation schema
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const validationSchema = yup.object({
    Requested_Department: yup.number().required("Department is required"),
    Requested_Officer: yup
      .string()
      .min(3, "Name should contain at least 3 characters")
      .required("Requested officer is required"),
    Visitor_Category: yup.number().required("Visitor category is required"),
    Purpose: yup.number().required("Visiting purpose is required"),
    Req_Date: yup
      .date()
      .required("Request date is required")
      .min(yesterday, "Date cannot be in the past"),
    Date_From: yup
      .date()
      .required("From date is required")
      .min(yup.ref("Req_Date"), "From date cannot be before request date"),
    Date_To: yup
      .date()
      .required("To date is required")
      .min(yup.ref("Date_From"), "To date cannot be before from date"),
    Time_From: yup.string().required("From time is required"),
    Time_To: yup
      .string()
      .required("To time is required")
      .test(
        "is-after-time-from",
        "To time must be after from time",
        function (value) {
          const { Time_From } = this.parent;
          if (!Time_From || !value) return true;
          return value > Time_From;
        },
      ),
    Breakfast: yup.boolean(),
    Lunch: yup.boolean(),
    Tea: yup.boolean(),
    Remark: yup.string().max(500, "Remark must be 500 characters or less"),
  });

  // Formik initialization
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      Requested_Department: "",
      Visitor_Category: "",
      Requested_Officer: "",
      Purpose: "",
      Date_From: "",
      Req_Date: "",
      Date_To: "",
      Time_From: "",
      Time_To: "",
      Breakfast: false,
      Lunch: false,
      Tea: false,
      Remark: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = {
          user_Data: UserData,
          Visit_Id: VisitId,
          Entry_Request: {
            Requested_Department: values.Requested_Department,
            Date_From: values.Req_Date,
            Requested_Officer: values.Requested_Officer,
            Visitor_Category: values.Visitor_Category,
          },
          Entry_Permit: {
            Purpose: values.Purpose,
            Date_From: values.Date_From,
            Date_To: values.Date_To,
            Time_From: values.Time_From,
            Time_To: values.Time_To,
          },
          Person: {
            Breakfast: values.Breakfast,
            Lunch: values.Lunch,
            Tea: values.Tea,
            Remark: values.Remark,
          },
        };

        const response = await axios.post(
          `${apiUrl}/visitor/updateVisitor`,
          formData,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          },
        );

        if (response.status === 200) {
          swal.fire({
            title: "Visit update success...!",
            text: "",
            icon: "success",
            showCancelButton: false,
            confirmButtonText: "Ok",
            confirmButtonColor: "#d33",
          });
          setSuccessMessages({
            type: "success",
            msg: "Data update success",
          });

          // Force refresh after 1 second to get updated data
          setTimeout(() => {
            setRefreshCount((prev) => prev + 1);
            fetchVisitData();
          }, 1000);
        }
      } catch (error) {
        console.error(error);
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setErrorMessages(error.response.data.message || "Bad request");
              break;
            case 401:
              swal.fire({
                title: "You don't have permission to perform this action",
                text: "Please login to the system again",
                icon: "warning",
                confirmButtonText: "Ok",
              });
              navigate("/");
              break;
            case 403:
              swal.fire({
                title: "Your session has expired",
                text: "Please login again",
                icon: "warning",
                confirmButtonText: "Ok",
              });
              navigate("/");
              break;
            default:
              setErrorMessages("An error occurred. Please try again.");
          }
        } else {
          setErrorMessages("Network error. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  // API functions
  const getVCategories = async () => {
    try {
      const result = await axios.get(
        `${apiUrl}/visitor/getVisitor-categories`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        },
      );

      if (result.status === 200) {
        setVisitorCategory(result.data.data);
      }
    } catch (error) {
      setVisitorCategory([]);
    }
  };

  const getVisitingPurpose = async (category_id) => {
    try {
      const result = await axios.get(
        `${apiUrl}/visitor/getVisiting_purpose/${category_id}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        },
      );

      if (result.status === 200) {
        setVisitorPurposes(result.data.data);
      }
    } catch (error) {
      setVisitorPurposes([]);
    }
  };

  const getDepartments = async () => {
    try {
      const visitorList = await axios.get(
        `${apiUrl}/visitor/getDepartments/${UserData.userFactoryId}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        },
      );
      if (visitorList) {
        setDepartmentList(visitorList.data.data);
      }
    } catch (error) {
      setErrorMessages(error.message);
    }
  };

  const getCsrf = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getCSRFToken`, {
        withCredentials: true,
      });
      if (response) {
        setCsrfToken(response.data.csrfToken);
      }
    } catch (error) {
      console.error(`Error while fetching csrf token: ${error}`);
    }
  };

  // Delete record function - UPDATED: Check if D_User is null before allowing delete
  const deleteRecord = async (e) => {
    e.preventDefault();

    // Check if visit is already approved by department user
    if (Visits?.D_User !== null) {
      swal.fire({
        title: "Cannot Delete",
        text: "This visit has already been approved by department user and cannot be deleted.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      swal
        .fire({
          title: "Are you sure?",
          text: "This action cannot be undone.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel!",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            const response = await axios.delete(
              `${apiUrl}/visitor/delete-visit-dUser/${Visitor?.ContactPerson_Id}`,
              { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true },
            );

            if (response.status === 200) {
              swal.fire({
                title: "Visit delete success...!",
                text: "",
                icon: "success",
                showCancelButton: false,
                confirmButtonText: "Ok",
                confirmButtonColor: "#d33",
              });
              navigate(-1);
            }
          }
        });
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            swal.fire({
              title: "You don't have permission to perform this action",
              text: "Please login again",
              icon: "warning",
              confirmButtonText: "Ok",
            });
            navigate("/");
            break;
          case 403:
            swal.fire({
              title: "Your session has expired",
              text: "Please login again",
              icon: "warning",
              confirmButtonText: "Ok",
            });
            navigate("/");
            break;
          default:
            console.error(error);
        }
      }
    }
  };

  // Initialize data fetching
  useEffect(() => {
    const initialize = async () => {
      await getCsrf();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (csrfToken) {
      getDepartments();
      getVCategories();

      if (visitId) {
        fetchVisitData();
      }
    }
  }, [csrfToken, visitId, refreshCount]);

  // Add refresh button handler
  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
  };

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading visit data...</p>
      </div>
    );
  }

  if (!visitorData && !isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Visit Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The requested visit could not be loaded.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Header
          userName={UserData.userName}
          userCategory={UserData.userCategory}
          userDepartment={UserData.userDepartment}
          displayHamb={false}
        />

        <div className="mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 w-full">
            <div className="flex items-center mb-4 md:mb-0">
              <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                  {Visitor?.ContactPerson_Name || "No Name"}
                </h1>
                <p className="text-sm text-gray-600">Visit ID: {VisitId}</p>
                <p className="text-xs text-gray-500">
                  Status:{" "}
                  {Visits?.D_User
                    ? "Approved by Dept User"
                    : "Pending Dept User"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Refresh
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDisabled || isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={deleteRecord}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDisabled || Visits?.D_User !== null}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Status Messages */}
          <motion.div
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", height: "auto", opacity: 1 }}
            transition={{
              delay: 2,
              duration: 1,
            }}
            className="mt-6 mb-4"
          >
            {successMessages.msg && (
              <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold text-lg flex justify-center items-center">
                <FaCircleCheck className="text-lg mr-2" />
                {successMessages.msg}
              </div>
            )}
            {errorMessages && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
                {errorMessages}
              </div>
            )}
          </motion.div>

          {/* Debug Info (remove in production) */}
          {/* <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <p>
              D_User:{" "}
              {Visits.D_User
                ? `Approved by user ID: ${Visits.D_User}`
                : "Not approved yet"}
            </p>
            <p>
              Dept Head Approval:{" "}
              {Visits.D_Head_Approval ? "Approved" : "Pending"}
            </p>
            <p>HR Approval: {Visits.HR_Approval ? "Approved" : "Pending"}</p>
            <p>Last Updated: {new Date().toLocaleTimeString()}</p>
          </div> */}

          {/* Main Content - Two Column Layout */}
          <div className="m-0 flex flex-col lg:flex-row gap-4 lg:gap-[2%] w-full">
            {/* Left Column - Entry Permit Request */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[200px]">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                Entry Permit Request Details
              </h2>

              <div className="grid grid-cols-1 gap-2">
                {/* Department Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Requested Dep: <span className="text-red-600">*</span>
                  </label>
                  <div className="md:col-span-3 w-full md:w-2/4">
                    <select
                      name="Requested_Department"
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.Requested_Department}
                      disabled={isDisabled}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                    >
                      <option value="">Select a Department:</option>
                      {Array.isArray(departmentList) &&
                        departmentList.map((department) => (
                          <option
                            key={department.Department_Id}
                            value={department.Department_Id}
                          >
                            {department.Department_Name}
                          </option>
                        ))}
                    </select>
                    {formik.touched.Requested_Department &&
                      formik.errors.Requested_Department && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Requested_Department}
                        </div>
                      )}
                  </div>
                </div>

                {/* Requested Date */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Requested Date: <span className="text-red-600">*</span>
                  </label>
                  <div className="md:col-span-3 w-full md:w-2/4">
                    <input
                      type="date"
                      name="Req_Date"
                      disabled={isDisabled}
                      value={formik.values.Req_Date}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                    />
                    {formik.touched.Req_Date && formik.errors.Req_Date && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Req_Date}
                      </div>
                    )}
                  </div>
                </div>

                {/* Requested Officer */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Requested Officer: <span className="text-red-600">*</span>
                  </label>
                  <div className="md:col-span-3 w-full md:w-2/4">
                    <input
                      name="Requested_Officer"
                      onChange={formik.handleChange}
                      disabled={isDisabled}
                      onBlur={formik.handleBlur}
                      value={formik.values.Requested_Officer}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                    />
                    {formik.touched.Requested_Officer &&
                      formik.errors.Requested_Officer && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Requested_Officer}
                        </div>
                      )}
                  </div>
                </div>

                {/* Visitor Category */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Visitor Category: <span className="text-red-600">*</span>
                  </label>
                  <div className="md:col-span-3 w-full md:w-2/4">
                    <select
                      name="Visitor_Category"
                      value={formik.values.Visitor_Category}
                      disabled={isDisabled}
                      onChange={(e) => {
                        formik.handleChange(e);
                        getVisitingPurpose(e.target.value);
                      }}
                      onBlur={formik.handleBlur}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                    >
                      <option value="">Select a Category</option>
                      {Array.isArray(visitorCategory) &&
                        visitorCategory.map((vCategory) => (
                          <option
                            value={vCategory.visitor_category_id}
                            key={vCategory.visitor_category_id}
                          >
                            {vCategory.visitor_category}
                          </option>
                        ))}
                    </select>
                    {formik.touched.Visitor_Category &&
                      formik.errors.Visitor_Category && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Visitor_Category}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Entry Permit Details */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] h-auto min-h-[190px]">
              <h1 className="font-bold text-lg text-blue-950 mb-2">
                Entry Permit Details
              </h1>

              <div className="grid grid-cols-1 gap-2">
                {/* Purpose */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Purpose: <span className="text-red-600">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      name="Purpose"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.Purpose}
                      disabled={isDisabled}
                      className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                    >
                      <option value="">Select a Purpose</option>
                      {Array.isArray(visitorPurposes) &&
                        visitorPurposes.map((purpose) => (
                          <option
                            value={purpose.visiting_purpose_id}
                            key={purpose.visiting_purpose_id}
                          >
                            {purpose.visiting_purpose}
                          </option>
                        ))}
                    </select>
                    {formik.touched.Purpose && formik.errors.Purpose && (
                      <div className="text-red-600 text-sm">
                        {formik.errors.Purpose}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="text-sm sm:w-1/3">
                    Date: <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-1 gap-2">
                    <div className="flex-1">
                      <label className="text-sm">From</label>
                      <input
                        type="date"
                        name="Date_From"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.Date_From}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                        disabled={isDisabled}
                      />
                      {formik.touched.Date_From && formik.errors.Date_From && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Date_From}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-sm">To</label>
                      <input
                        type="date"
                        name="Date_To"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.Date_To}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                        disabled={isDisabled}
                      />
                      {formik.touched.Date_To && formik.errors.Date_To && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Date_To}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time Range */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="text-sm sm:w-1/3">
                    Time: <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-1 gap-2">
                    <div className="flex-1">
                      <label className="text-sm">From</label>
                      <input
                        type="time"
                        name="Time_From"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.Time_From}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                        disabled={isDisabled}
                      />
                      {formik.touched.Time_From && formik.errors.Time_From && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Time_From}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-sm">To</label>
                      <input
                        type="time"
                        name="Time_To"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.Time_To}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                        disabled={isDisabled}
                      />
                      {formik.touched.Time_To && formik.errors.Time_To && (
                        <div className="text-red-600 text-sm">
                          {formik.errors.Time_To}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Two Column Layout */}
          <div className="flex flex-col lg:flex-row lg:gap-[2%] w-full mt-5">
            {/* Left Card - Person */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px]">
              <h1 className="font-bold text-lg text-blue-950 mb-2">Person</h1>
              <div className="overflow-x-auto">
                <table className="w-full tblVisitors">
                  <thead>
                    <tr>
                      <th className="text-sm text-left">Name</th>
                      <th className="text-sm text-left">NIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(visitorGroup) && visitorGroup.length > 0 ? (
                      visitorGroup.map((visitor) => (
                        <tr key={visitor.Visitor_Id}>
                          <td className="text-sm border pl-2 border-black">
                            {visitor.Visitor_Name}
                          </td>
                          <td className="text-sm border pl-2 border-black">
                            {visitor.Visitor_NIC}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="text-sm text-center py-4 text-gray-500"
                        >
                          No visitors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-lg text-blue-950 mb-2 text-left">
                  Meal Plan
                </h3>
                <div className="flex justify-start gap-4 mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="Breakfast"
                      onChange={formik.handleChange}
                      checked={formik.values.Breakfast}
                      disabled={isDisabled}
                      id="Breakfast"
                      className="mr-1"
                    />
                    <label htmlFor="Breakfast" className="text-sm">
                      Breakfast
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="Lunch"
                      onChange={formik.handleChange}
                      disabled={isDisabled}
                      checked={formik.values.Lunch}
                      id="Lunch"
                      className="mr-1"
                    />
                    <label htmlFor="Lunch" className="text-sm">
                      Lunch
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="Tea"
                      onChange={formik.handleChange}
                      disabled={isDisabled}
                      checked={formik.values.Tea}
                      id="Tea"
                      className="mr-1"
                    />
                    <label htmlFor="Tea" className="text-sm">
                      Tea
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-1">Additional Note</h3>
                  <textarea
                    rows="4"
                    name="Remark"
                    onChange={formik.handleChange}
                    disabled={isDisabled}
                    onBlur={formik.handleBlur}
                    value={formik.values.Remark}
                    className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                  ></textarea>
                  {formik.touched.Remark && formik.errors.Remark && (
                    <div className="text-red-600 text-sm">
                      {formik.errors.Remark}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card - Vehicle */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px] mt-5 lg:mt-0">
              <h1 className="font-bold text-lg text-blue-950 mb-2">Vehicle</h1>
              <div className="overflow-x-auto">
                <table className="w-full tblVisitors">
                  <thead>
                    <tr>
                      <th className="text-sm text-left">Vehicle Type</th>
                      <th className="text-sm text-left">Vehicle No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(Vehicles) && Vehicles.length > 0 ? (
                      Vehicles.map((vehicle) => (
                        <tr key={vehicle.Vehicle_Id}>
                          <td className="text-sm border pl-2 border-black">
                            {vehicle.Vehicle_Type}
                          </td>
                          <td className="text-sm border pl-2 border-black">
                            {vehicle.Vehicle_No}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="text-sm text-center py-4 text-gray-500"
                        >
                          No vehicles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* bottom card - Approval Status - UPDATED */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px] mt-5 lg:mt-0">
              <h1 className="font-bold text-lg text-blue-950 mb-2">
                Approval Status
              </h1>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-sm text-center">Department User</th>
                      {/* <th className="text-sm text-center">Department Head</th> */}
                      <th className="text-sm text-center">HR Approval</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="border border-black">
                        {/* UPDATED: Check D_User instead of D_User field */}
                        {Visits.D_User !== null ? (
                          <div className="flex flex-col items-center text-green-900 p-2">
                            <IoCheckmarkCircleOutline className="text-xl" />
                            <span className="text-xs font-semibold">
                              Approved
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-yellow-900 p-2">
                            <BsExclamationCircle className="text-xl" />
                            <span className="text-xs font-semibold">
                              Pending
                            </span>
                          </div>
                        )}
                      </td>
                      {/* <td className="border border-black">
                        {Visits.D_Head_Approval === true ? (
                          <div className="flex flex-col items-center text-green-900 p-2">
                            <IoCheckmarkCircleOutline className="text-xl" />
                            <span className="text-xs font-semibold">
                              Approved
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-yellow-900 p-2">
                            <BsExclamationCircle className="text-xl" />
                            <span className="text-xs font-semibold">
                              Pending
                            </span>
                          </div>
                        )}
                      </td> */}
                      <td className="border border-black">
                        {Visits.HR_Approval === true ? (
                          <div className="flex flex-col items-center text-green-900 p-2">
                            <IoCheckmarkCircleOutline className="text-xl" />
                            <span className="text-xs font-semibold">
                              Approved
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-yellow-900 p-2">
                            <BsExclamationCircle className="text-xl" />
                            <span className="text-xs font-semibold">
                              Pending
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4">
                  {/* approved department user */}
                  <div className="">
                    <h3 className="text-sm">Department User Approved By:</h3>
                    <p className="pl-7 mt-1 mb-2 text-sm text-blue-900">
                      {apNames.departmentUser || "Not approved yet"}
                    </p>
                  </div>
                  {/* approved department head */}
                  {/* <div className="">
                    <h3 className="text-sm">Department Head:</h3>
                    <p className="pl-7 mt-1 mb-2 text-sm text-blue-900">
                      {apNames.departmentHead || "Not approved yet"}
                    </p>
                  </div> */}
                  {/* approved hr user */}
                  <div className="">
                    <h3 className="text-sm">HR Approved By:</h3>
                    <p className="pl-7 mt-1 mb-2 text-sm text-blue-900">
                      {apNames.hrUser || "Not approved yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CDisplayVisitor;
