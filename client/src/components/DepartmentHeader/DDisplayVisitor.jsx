import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
// import CSidebar from "./CSidebar";
// import "./DDisplayVisitor.css";
import axios from "axios";
import { FaCircleCheck, FaPersonCircleExclamation } from "react-icons/fa6";
import swal from "sweetalert2";

const DDisplayVisitor = () => {
  const location = useLocation();
  const visitor = location.state?.visitor; // Access the passed visitor data
  let successOrError = { type: "", msg: "" };

  console.log("state", location.state);

  //destructuring data
  const Visitor = location.state?.visitor; //this is the details of contact person
  const visitorGroup = location.state?.visitor.Visitors; // the visitors group coming with contact person
  const UserData = location.state?.userData; //this is the details about current logged in user
  const Vehicles = location.state?.visitor.Vehicles; //this is the details about vehicels
  const Visits = location.state?.visitor.Visits[0]; //this is the variable that store visit details

  console.log("visits", Visits.Requested_Officer);

  console.log("user data from display data: ", UserData);
  // alert(Visits);

  console.log("visitors", visitor);
  console.log("visitor group", visitorGroup);
  console.log("vehicle group", Vehicles);

  const {
    userId,
    userName,
    userCategory,
    userDepartment,
    userFactoryId,
    userDepartmentId,
  } = UserData;
  const [departmentList, setDepartmentList] = useState({});
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState();

  const navigate = useNavigate();

  //to store entry permit req details
  const [entryPermitReq, setEntryPermitReq] = useState({
    Requested_Department: Visits.Department_Id || "",
    Date_From: Visits.Date_From || "",
    Requested_Officer: Visits.Requested_Officer || "",
    Visitor_Category: Visits.Visitor_Category || "",
  });
  const [entryPermit, setEntryPermit] = useState({
    Purpose: Visits.Purpose || "",
    Date_From: Visits.Date_From || "",
    Date_To: Visits.Date_To || "",
    Time_From: Visits.Time_From || "",
    Time_To: Visits.Time_To || "",
  });
  const [person, setPerson] = useState({
    Breakfast: Visits.Breakfast || "",
    Lunch: Visits.Lunch || "",
    Tea: Visits.Tea || "",
    Remark: Visits.Remark || "",
  });
  // const [vehicles, setVehicles] = useState({});
  const handleEntryPermitReq = (e) => {
    const { name, value } = e.target;
    // alert(value);
    switch (name) {
      case "Requested_Department":
        //validating requested department
        if (!value) {
          errorObj.Requested_Department = "Please slelect a department";
        } else {
          delete errorObj.Requested_Department;
        }
        break;

      case "Date_From":
        //validating date from
        if (!value) {
          errorObj.Date_From = "Please select a date";
        } else {
          delete errorObj.Date_From;
        }
        break;
      case "Requested_Officer":
        //Requested officer
        if (!value.trim()) {
          errorObj.Requested_Officer = "Requested officer name is required";
        } else {
          if (value.trim().length < 3) {
            // alert(value.length);
            errorObj.Requested_Officer =
              "Officer name should have at least 3 letters";
          } else {
            delete errorObj.Requested_Officer;
          }
          // delete errorObj.Requested_Officer;
        }
        setErrors(errorObj);
        break;

      case "Visitor_Category":
        //visitor category
        if (!value) {
          errorObj.Visitor_Category = "Please select user category";
        } else {
          delete errorObj.Visitor_Category;
        }

      default:
        break;
    }
    // alert(value);
    setEntryPermitReq({
      ...entryPermitReq,
      [name]: value === "" || value === null ? defaultValue : value,
      // [name]: value,
    });
    // alert(`${name}: ${value}`);
  };

  const VisitId = Visitor.Visits[0]?.Visit_Id;
  //to handle entry permit details
  const handleEntryPermit = (e) => {
    const { name, value } = e.target;
    // alert(`${name}: ${value}`);
    setEntryPermit({
      ...entryPermit,
      [name]: value === "" || value === null ? defaultValue : value,
    });
    // alert(`${name}: ${value}`);
  };

  //to handle person details
  const handlePerson = (e) => {
    const { name, value, checked, type } = e.target;
    setPerson({
      ...person,
      [name]: type === "checkbox" ? checked : value,
    });
    // alert(`${name}: ${value}`);
  };

  const reqDate = new Date(Visitor.Visits[0]?.Date_From)
    .toISOString()
    .split("T")[0];

  const dateTo = new Date(Visitor.Visits[0]?.Date_To)
    .toISOString()
    .split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const timeFrom = Visitor.Visits[0]?.Time_From;
  const timeTo = Visitor.Visits[0]?.Time_To;
  const [errors, setErrors] = useState({});
  // alert(timeFrom);
  // alert(timeFrom);

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

    //to get all departments
    const getDepartments = async () => {
      try {
        const visitorList = await axios.get(
          `http://localhost:3000/visitor/getDepartments/${userFactoryId}`,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (visitorList) {
          console.log("department list: ", visitorList.data.data);
          setDepartmentList(visitorList.data.data);
        }
      } catch (error) {
        setErrorMessages(error.message);
      }
    };
    getDepartments();
  }, []);

  // (departmentList && console.log(departmentList))
  const errorObj = {};

  const [successMessages, setSuccessMessages] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData = {
      userId: userId,
      userData: UserData,
      Visit_Id: VisitId,
      Entry_Request: entryPermitReq,
      Entry_Permit: entryPermit,
      Person: person,
    };

    const {
      Requested_Department,
      Date_From,
      Requested_Officer,
      Visitor_Category,
    } = entryPermitReq;

    //validating requested department
    if (!Requested_Department) {
      errorObj.Requested_Department = "Please slelect a department";
    } else {
      delete errorObj.Requested_Department;
    }

    //validating date from
    if (!Date_From) {
      errorObj.Date_From = "Please select a date";
    } else {
      delete errorObj.Date_From;
    }

    //Requested officer
    if (!Requested_Officer) {
      errorObj.Requested_Officer = "Requested officer name is required";
    } else {
      delete errorObj.Requested_Officer;
    }

    //visitor category
    if (!Visitor_Category) {
      errorObj.Visitor_Category = "Please select user category";
    } else {
      delete errorObj.Visitor_Category;
    }

    //gettign data from entrypermit
    const {
      Purpose,
      Date_From: DateFrm,
      Date_To,
      Time_From,
      Time_To,
    } = entryPermit;

    if (!Purpose) {
      errorObj.Purpose = "Please select a purpose";
    } else {
      delete errorObj.Purpose;
    }

    if (!DateFrm) {
      errorObj.DateFrm = "Please select a date";
    } else {
      delete errorObj.DateFrm;
    }

    if (!Time_From) {
      errorObj.Time_From = "Please select a time";
    } else {
      delete errorObj.Time_From;
    }

    if (!Time_To) {
      errorObj.Time_To = "Please select a time";
    } else {
      delete errorObj.Time_To;
    }

    setErrors(errorObj);

    if (Object.keys(errorObj).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/visitor/updateVisitor-dhead",
          formData,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        console.log("response ", response);

        if (response) {
          if (response.status === 200) {
            setIsLoading(false);
            swal.fire({
              title: "Approval success",
              text: "",
              icon: "success",
              confirmButtonText: "OK",
              showConfirmButton: true,
            });

            setSuccessMessages("Visitor Approve Success");
            // alert("Update success");
            setErrorMessages("");
            successOrError = {
              type: "success",
              msg: "Visitor Updated Successfully",
            };
          } else if (response.status === 500) {
            setIsLoading(false);
            successOrError = {
              type: "error",
              msg: "Visitor update failed please try again later",
            };
          } else {
            setIsLoading(false);
            successOrError = {
              type: "error",
              msg: "Unknown error occurred",
            };
          }
        }
      } catch (error) {
        switch (error.response.status) {
          case 401:
            swal.fire({
              title: "You don't have permission to perform this acction",
              text: "Please loging to the system using login page again",
              icon: "warning",
              confirmButtonAriaLabel: "Ok",
              showCancelButton: false,
            });
            setErrorMessages(
              "You don't have a permission to perform this action, please login again using loging page"
            );
            navigate("/");
            break;

          case 403:
            swal.fire({
              title: "Your session has been expired",
              text: "Your current session has been expired, please login again using your credentials",
              icon: "warning",
              confirmButtonText: "Ok",
              showCancelButton: false,
            });
            navigate("/");
            break;
          default:
        }
        setIsLoading(false);
        // Setting-up errors
        if (error.isAxiosError) {
          let errorMessage = "An error occurred.";

          if (error.response) {
            // Server responded with an error status code
            switch (error.response.status) {
              case 400:
                // If validation errors are present in the response, extract and show them
                if (
                  error.response.data.errors &&
                  error.response.data.errors.length > 0
                ) {
                  const validationErrors = error.response.data.errors
                    .map((err) => err.msg)
                    .join(", ");
                  setErrorMessages(validationErrors); // Set validation errors as the state
                  errorMessage = validationErrors; // Show the validation errors as a single string
                } else {
                  setErrorMessages("Bad request. Please check your input.");
                  errorMessage =
                    error.response.data.message ||
                    "Bad request. Please check your input. error code 400";
                }
                break;

              case 401:
                swal.fire({
                  title: "You don't have permission to perform this acction",
                  text: "Please loging to the system using login page again",
                  icon: "warning",
                  confirmButtonAriaLabel: "Ok",
                  showCancelButton: false,
                });
                setErrorMessages(
                  "You don't have a permission to perform this action, please login again using loging page"
                );
                navigate("/");

              case 404:
                setErrorMessages("Resource page not found. error code 404");
                errorMessage = "Resource not found.";
                break;

              case 403:
                swal.fire({
                  title: "Your session has been expired",
                  text: "Your current session has been expired, please login again using your credentials",
                  icon: "warning",
                  confirmButtonText: "Ok",
                  showCancelButton: false,
                });
                navigate("/");

              case 500:
                setErrorMessages(
                  "Internal server error. Please try again later. error code 500"
                );
                errorMessage = "Internal server error. Please try again later.";
                break;

              default:
                setErrorMessages("An unexpected error occurred.");
                errorMessage =
                  error.response.data.message ||
                  "An unexpected error occurred.";
            }
          } else if (error.request) {
            // No response received (network issue)
            setErrorMessages(
              "Network error. Please check your internet connection."
            );
            errorMessage =
              "Network error. Please check your internet connection.";
          }

          // alert(errorMessage); // Show the error message to the user
        } else {
          // Non-Axios error (e.g., programming errors)
          setErrorMessages("An unexpected error occurred.");
          alert("An unexpected error occurred.");
          console.error("Error:", error);
        }
      }
    } else {
      alert("Please fill all the required(*) fields before submit");
    }
    console.log("error or success", successOrError);
    // console.log(formData);
  };

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <form onSubmit={handleSubmit} className="mx-auto w-full m-0">
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
          <div className="flex flex-col sm:flex-row justify-center gap-20 items-start sm:items-center mb-2 w-full">
            {/* <div className="flex items-center gap-3">
              <FaPersonCircleExclamation className="text-black text-3xl md:text-4xl" />
              <h1 className="text-sky-600 text-xl md:text-2xl font-semibold">
                {Visitor.ContactPerson_Name}
              </h1>
            </div> */}

            <div className="flex items-center mb-4 md:mb-0">
              <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                {Visitor.ContactPerson_Name}
              </h1>
            </div>

            <div className="flex gap-2 sm:w-auto w-2/4 mb-2 float-right pr-8">
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
              >
                Approve
              </button>
            </div>
          </div>

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
                      onChange={handleEntryPermitReq}
                      className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                    >
                      <option value="">Select a Department:</option>
                      {Array.isArray(departmentList) &&
                        departmentList.map((department) => (
                          <option
                            key={department.Department_Id}
                            value={department.Department_Id}
                            selected={
                              Visits.Department_Id === department.Department_Id
                            }
                          >
                            {department.Department_Name}
                          </option>
                        ))}
                    </select>
                    {errors.Requested_Department && (
                      <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                        {errors.Requested_Department}
                      </p>
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
                      name="Date_From"
                      onChange={handleEntryPermitReq}
                      defaultValue={reqDate}
                      className="w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                    />
                    {errors.Date_From && (
                      <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                        {errors.Date_From}
                      </p>
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
                      onChange={handleEntryPermitReq}
                      defaultValue={Visits.Requested_Officer}
                      className=" w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                    />
                    {errors.Requested_Officer && (
                      <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                        {errors.Requested_Officer}
                      </p>
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
                      onChange={handleEntryPermitReq}
                      className="w-full text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                    >
                      <option
                        selected={Visits.Visitor_Category === ""}
                        value=""
                      >
                        Select a Category
                      </option>
                      <option
                        selected={Visits.Visitor_Category === "HR Services"}
                        value="HR Services"
                      >
                        HR Services
                      </option>
                      <option
                        selected={Visits.Visitor_Category === "Interview"}
                        value="Interview"
                      >
                        Interview
                      </option>
                    </select>
                    {errors.Visitor_Category && (
                      <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                        {errors.Visitor_Category}
                      </p>
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
                  <select
                    name="Purpose"
                    onChange={handleEntryPermit}
                    className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                  >
                    <option
                      value=""
                      selected={
                        Visits.Purpose === "" || Visits.Purpose === null
                      }
                    >
                      Select a Purpose
                    </option>
                    <option
                      value="HR Services"
                      selected={Visits.Purpose === "HR Services"}
                    >
                      HR Services
                    </option>
                  </select>
                </div>
                {errors.Purpose && (
                  <p className="error text-sm">{errors.Purpose}</p>
                )}

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
                        onChange={handleEntryPermit}
                        defaultValue={reqDate}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm">To</label>
                      <input
                        type="date"
                        name="Date_To"
                        onChange={handleEntryPermit}
                        defaultValue={dateTo >= today ? dateTo : null}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                      />
                    </div>
                  </div>
                </div>
                {errors.DateFrm && (
                  <p className="error text-sm">{errors.DateFrm}</p>
                )}
                {errors.Date_To && (
                  <p className="error text-sm">{errors.Date_To}</p>
                )}

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
                        onChange={handleEntryPermit}
                        defaultValue={timeFrom}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm">To</label>
                      <input
                        type="time"
                        name="Time_To"
                        onChange={handleEntryPermit}
                        defaultValue={timeTo}
                        className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                      />
                    </div>
                  </div>
                </div>
                {errors.Time_From && (
                  <p className="error text-sm">{errors.Time_From}</p>
                )}
                {errors.Time_To && (
                  <p className="error text-sm">{errors.Time_To}</p>
                )}
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
                      onChange={handlePerson}
                      defaultChecked={Visits.Breakfast === true}
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
                      onChange={handlePerson}
                      defaultChecked={Visits.Lunch === true}
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
                      onChange={handlePerson}
                      defaultChecked={Visits.Tea === true}
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
                    onChange={handlePerson}
                    className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                    defaultValue={Visits.Remark}
                  ></textarea>
                </div>
              </div>
            </div>

            {/*  border border-black Details */}
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

          {/* Status Messages */}
          <div className="mt-6 space-y-2">
            {successOrError?.msg && (
              <div
                className={`p-3 rounded-md text-center ${
                  successOrError.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <p className="font-medium">{successOrError.msg}</p>
              </div>
            )}

            {errorMessages && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
                <p className="font-medium">{errorMessages}</p>
              </div>
            )}

            {successMessages && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md text-center">
                <p className="font-medium flex items-center justify-center gap-2">
                  <FaCircleCheck className="text-lg" />
                  {successMessages}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default DDisplayVisitor;
