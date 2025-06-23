import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
import CSidebar from "./CSidebar";
import axios from "axios";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { useFormik } from "formik";
import { FaCircleCheck } from "react-icons/fa6";
import * as yup from "yup";
import swal from "sweetalert2";
import { motion } from "framer-motion";

const CDisplayVisitor = () => {
  const curDate = new Date();
  const location = useLocation();
  const navigate = useNavigate();
  const visitor = location.state?.visitor;
  const [isLoading, setIsLoading] = useState(false);

  // Destructuring data
  const Visitor = location.state?.visitor;
  const visitorGroup = location.state?.visitor.Visitors;
  const UserData = location.state?.userData;
  const Vehicles = location.state?.visitor.Vehicles;
  const Visits = location.state?.visitor.Visits[0];
  const VisitId = Visitor.Visits[0]?.Visit_Id;

  const [serverErrors, setServerErrors] = useState({ type: "", msg: "" });
  const [successMessages, setSuccessMessages] = useState({ type: "", msg: "" });
  const [departmentList, setDepartmentList] = useState({});
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState();
  const [visitorCategory, setvisitorCategory] = useState({});
  const [visitorPurposes, setvisitorPurposes] = useState({});
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
  const toDay = new Date().toISOString().split("T")[0];
  // alert(`date from ${dateFrom} < today ${toDay}`);
  const isDisabled = dateFrom < toDay;
  // alert(isDisabled);

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
          }
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
      setvisitorCategory({});
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
      setvisitorPurposes({});
    }
  };

  const getDepartments = async () => {
    try {
      const visitorList = await axios.get(
        `${apiUrl}/visitor/getDepartments/${UserData.userFactoryId}`,
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

  // Delete record function
  const deleteRecord = async (e) => {
    e.preventDefault();
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
              `${apiUrl}/visitor/delete-visit-dUser/${Visitor.ContactPerson_Id}`,
              { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
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

  useEffect(() => {
    getCsrf();
    getDepartments();
    getVCategories();
  }, []);

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
          <div className="flex flex-col md:flex-row items-center mb-6 w-full md:gap-36">
            <div className="flex items-center mb-4 md:mb-0">
              <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                {Visitor.ContactPerson_Name}
              </h1>
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
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                disabled={isDisabled}
              >
                Save
              </button>
              <button
                type="button"
                onClick={deleteRecord}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
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
                    {Array.isArray(visitorGroup) &&
                      visitorGroup.map((visitor) => (
                        <tr key={visitor.Visitor_Id}>
                          <td className="text-sm border pl-2 border-black">
                            {visitor.Visitor_Name}
                          </td>
                          <td className="text-sm border pl-2 border-black">
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
                    {Array.isArray(Vehicles) &&
                      Vehicles.map((vehicle) => (
                        <tr key={vehicle.Vehicle_Id}>
                          <td className="text-sm border pl-2 border-black">
                            {vehicle.Vehicle_Type}
                          </td>
                          <td className="text-sm border pl-2 border-black">
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

export default CDisplayVisitor;
