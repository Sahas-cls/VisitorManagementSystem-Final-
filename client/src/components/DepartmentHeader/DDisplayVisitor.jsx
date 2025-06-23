import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
import axios from "axios";
import { FaCircleCheck, FaPersonCircleExclamation } from "react-icons/fa6";
import { useFormik } from "formik";
import * as yup from "yup";
import swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const DDisplayVisitor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const Visitor = location.state?.visitor;
  const visitorGroup = location.state?.visitor.Visitors;
  const UserData = location.state?.userData;
  const Vehicles = location.state?.visitor.Vehicles;
  const Visits = location.state?.visitor.Visits[0];
  const VisitId = Visitor.Visits[0]?.Visit_Id;

  const approvalStatus = Visits.D_Head_Approval;

  const {
    userId,
    userName,
    userCategory,
    userDepartment,
    userFactoryId,
    userDepartmentId,
  } = UserData;

  const [departmentList, setDepartmentList] = useState([]);
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorCategory, setvisitorCategory] = useState([]);
  const [visitorPurposes, setvisitorPurposes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessages, setSuccessMessages] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  const reqDate = new Date(Visits?.Date_From).toISOString().split("T")[0];
  const dateTo = new Date(Visits?.Date_To).toISOString().split("T")[0];
  const dateFrom = new Date(Visits?.Date_From).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const timeFrom = Visits?.Time_From;
  const timeTo = Visits?.Time_To;

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
        }
      ),
    Breakfast: yup.boolean(),
    Lunch: yup.boolean(),
    Tea: yup.boolean(),
    Remark: yup.string().max(500, "Remark must be 500 characters or less"),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      Requested_Department: Visits?.Department_Id || "",
      Visitor_Category: Visits?.Visitor_Category || "",
      Requested_Officer: Visits?.Requested_Officer || "",
      Purpose: Visits?.Purpose || "",
      Date_From: dateFrom || "",
      Req_Date: reqDate || "",
      Date_To: dateTo || "",
      Time_From: Visits?.Time_From || "",
      Time_To: Visits?.Time_To || "",
      Breakfast: Visits?.Breakfast || false,
      Lunch: Visits?.Lunch || false,
      Tea: Visits?.Tea || false,
      Remark: Visits?.Remark || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const formData = {
          userId: userId,
          userData: UserData,
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
          `${apiUrl}/visitor/updateVisitor-dhead`,
          formData,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          swal.fire({
            title: "Approval success",
            text: "",
            icon: "success",
            confirmButtonText: "OK",
          });
          setSuccessMessages("Visitor Approve Success");
          setErrorMessages("");
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
        }
      );
      if (result.status === 200) {
        setvisitorCategory(result.data.data);
      }
    } catch (error) {
      setvisitorCategory([]);
    }
  };

  const getVisitingPurpose = async (category_id) => {
    try {
      const result = await axios.get(
        `${apiUrl}/visitor/getVisiting_purpose/${category_id}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (result.status === 200) {
        setvisitorPurposes(result.data.data);
      }
    } catch (error) {
      setvisitorPurposes([]);
    }
  };

  const getDepartments = async () => {
    try {
      const visitorList = await axios.get(
        `${apiUrl}/visitor/getDepartments/${userFactoryId}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
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

  useEffect(() => {
    getCsrf();
    getDepartments();
    getVCategories();
    if (Visits?.Visitor_Category) {
      getVisitingPurpose(Visits.Visitor_Category);
    }
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <form onSubmit={formik.handleSubmit} className="mx-auto w-full m-0">
        <Header
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
        />

        {/* Main Content Container */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-center md:gap-36 items-center md:items-start sm:items-center mb-2 w-full">
            <div className="flex items-center mb-4 md:mb-0">
              <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                {Visitor.ContactPerson_Name}
              </h1>
            </div>

            <div className="grid grid-cols-2 space-x-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-md font transition-colors w-full sm:w-auto md:text-sm"
                type="button"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md font transition-colors w-full sm:w-auto"
                type="submit"
                disabled={approvalStatus}
              >
                Approve
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
              stiffness: 200,
            }}
            className="mt-6 space-y-2 mb-4"
          >
            {errorMessages && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
                <p className="font-medium">{errorMessages}</p>
              </div>
            )}

            {successMessages && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md text-center">
                <p className="font-bold flex items-center justify-center gap-2">
                  <FaCircleCheck className="text-lg" />
                  {successMessages}
                </p>
              </div>
            )}
          </motion.div>

          {/* Top Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 w-full">
            {/* Left Column - Request Details */}
            <div className="bg-blue-200 p-3 rounded-lg shadow-custom1 min-h-[200px] lg:w-full">
              <h2 className="text-xl font-bold mb-4 text-blue-800">
                Entry Permit Request Details
              </h2>

              <div className="grid grid-cols-1 gap-2">
                {/* Department Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm sm:w-1/3">
                    Request Dep: <span className="text-red-600">*</span>
                  </label>
                  <div className="md:col-span-3">
                    <select
                      name="Requested_Department"
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      onBlur={formik.handleBlur}
                      value={formik.values.Requested_Department}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                      disabled={approvalStatus}
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
                  <div className="md:col-span-3">
                    <input
                      type="date"
                      name="Req_Date"
                      value={formik.values.Req_Date}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                      disabled={approvalStatus}
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
                  <div className="md:col-span-3">
                    <input
                      name="Requested_Officer"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.Requested_Officer}
                      className="w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                      disabled={approvalStatus}
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
                  <div className="md:col-span-3">
                    <select
                      name="Visitor_Category"
                      value={formik.values.Visitor_Category}
                      onChange={(e) => {
                        formik.handleChange(e);
                        getVisitingPurpose(e.target.value);
                      }}
                      onBlur={formik.handleBlur}
                      className="w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                      disabled={approvalStatus}
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

            {/* Right Column - Permit Details */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 h-auto min-h-[190px] lg:w-full">
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
                      className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                      disabled={approvalStatus}
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
                        disabled={approvalStatus}
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
                        disabled={approvalStatus}
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
                        disabled={approvalStatus}
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
                        disabled={approvalStatus}
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

          {/* Bottom Section - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Person Details */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-full min-h-[330px]">
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
                    {Array.isArray(visitorGroup) &&
                      visitorGroup.map((visitor) => (
                        <tr key={visitor.Visitor_Id}>
                          <td className="text-sm border border-black">
                            {visitor.Visitor_Name}
                          </td>
                          <td className="text-sm border border-black">
                            {visitor.Visitor_NIC}
                          </td>
                        </tr>
                      ))}
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
                      id="Breakfast"
                      className="mr-1"
                      disabled={approvalStatus}
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
                      checked={formik.values.Lunch}
                      id="Lunch"
                      className="mr-1"
                      disabled={approvalStatus}
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
                      checked={formik.values.Tea}
                      id="Tea"
                      className="mr-1"
                      disabled={approvalStatus}
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
                    onBlur={formik.handleBlur}
                    value={formik.values.Remark}
                    className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                    disabled={approvalStatus}
                  ></textarea>
                  {formik.touched.Remark && formik.errors.Remark && (
                    <div className="text-red-600 text-sm">
                      {formik.errors.Remark}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-full min-h-[330px] mt-5 lg:mt-0">
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
                    {Array.isArray(Vehicles) &&
                      Vehicles.map((vehicle) => (
                        <tr key={vehicle.Vehicle_Id}>
                          <td className="text-sm border border-black">
                            {vehicle.Vehicle_Type}
                          </td>
                          <td className="text-sm border border-black">
                            {vehicle.Vehicle_No}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DDisplayVisitor;
