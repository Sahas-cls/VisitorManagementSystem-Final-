import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
import swal from "sweetalert2";
// import CSidebar from "./CSidebar";
// import "./HDisplayVisitor.css";
import axios from "axios";
import { FaPersonCircleExclamation } from "react-icons/fa6";
// import Factory from "../../../../server/models/Factory";

const HDisplayVisitor = () => {
  const location = useLocation();
  const visitor = location.state?.visitor; // Access the passed visitor data

  console.log("state", location.state);

  //destructuring data
  const Visitor = location.state?.visitor; //this is the details of contact person
  const visitorGroup = location.state?.visitor.Visitors; // the visitors group coming with contact person
  const UserData = location.state?.userData; //this is the details about current logged in user
  const Vehicles = location.state?.visitor.Vehicles; //this is the details about vehicels
  const Visits = location.state?.visitor.Visits[0]; //this is the variable that store visit details

  console.log("userdata ============== ", UserData);

  console.log("user data from display data: ", UserData);
  // alert(Visits);

  console.log("visitors", visitor);
  console.log("visitor group", visitorGroup);
  console.log("vehicle group", Vehicles);

  const { userName, userCategory, userDepartment, userId, userFactoryId } =
    UserData;
  const [departmentList, setDepartmentList] = useState({});
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [visitorCategory, setvisitorCategory] = useState({});
  const [visitorPurposes, setvisitorPurposes] = useState({});

  // to get all visitor categories from backend
  const getVCategories = async () => {
    // alert("getting v categories");
    try {
      const result = await axios.get(
        `http://localhost:3000/visitor/getVisitor-categories`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (result.status === 200) {
        setvisitorCategory(result.data.data);
        console.log("getting v categories", result.data);
      }
    } catch (error) {
      setvisitorCategory({});
    }
  };

  const getVisitingPurpose = async (category_id) => {
    try {
      const result = await axios.get(
        `http://localhost:3000/visitor/getVisiting_purpose/${category_id}`,
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
        if (!value) {
          errorObj.Requested_Officer = "Requested officer name is required";
        } else {
          if (value.length < 3) {
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

    getVisitingPurpose(value);

    setEntryPermitReq({
      ...entryPermitReq,
      [name]: value === "" || value === null ? defaultValue : value,
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
      // alert("sending request");
      try {
        const visitorList = await axios.get(
          "http://localhost:3000/visitor/getDepartments/" + userFactoryId,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (visitorList) {
          // alert("visitor list")
          console.log("department list: ", visitorList.data.data);
          setDepartmentList(visitorList.data.data);
        }
      } catch (error) {
        // alert("error from catch block")
        setErrorMessages(error.message);
      }
    };
    getDepartments();
    getVCategories();
    getVisitingPurpose(Visits.Visitor_Category);

    // disabling all input fields
    // const inputBoxes = document.querySelectorAll(
    //   ".cdInput, .select-input, .text-area"
    // );
    // inputBoxes.forEach((input) => {
    //   input.readOnly = true;
    // });

    // const selectBoxes = document.querySelectorAll(".select-input");
    // selectBoxes.forEach((input) => {
    //   input.disabled = true;
    // });
  }, []);

  // ! stopped by here retrive the visiting purpose when changes happend to the visitis state
  // const [visitingPurpose, setvisitingPurpose] = useState(second);
  // useEffect(() => {
  //   const getPurpose = async () => {
  //     const result = await axios.get('')
  //   };
  // }, [Visits]);

  // (departmentList && console.log(departmentList))
  const errorObj = {};
  let successOrError = { type: "", msg: "" };
  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData = {
      userId: userId,
      UserData: UserData,
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
      try {
        setIsLoading(true);
        const response = await axios.post(
          "http://localhost:3000/visitor/updateVisitor-hr",
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
            successOrError = {
              type: "success",
              msg: "Visitor Updated Successfully",
            };
          } else if (response.status === 500) {
            setIsLoading(false);
            successOrError = {
              type: "error",
              msg: "Visitor update failed with error code 500",
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

              case 404:
                setErrorMessages("Resource page not found. error code 404");
                errorMessage = "Resource not found.";
                break;

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

          alert(errorMessage); // Show the error message to the user
        } else {
          // Non-Axios error (e.g., programming errors)
          setErrorMessages("An unexpected error occurred.");
          // alert("An unexpected error occurred.");
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
    <div className="relative min-h-screen bg-white">
      {/* <h1>user factory id: {userFactoryId || null}</h1> */}
      <form onSubmit={handleSubmit}>
        <Header
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
        />
        <div className="mx-auto px-4 py-6">
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* <CSidebar /> */}
          <div className="flex flex-col md:flex-col justify-between mb-6">
            <div className="ml-5 rounded-m flex justify-center gap-20">
              <div className="flex items-center mb-4 md:mb-0">
                <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
                <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                  {Visitor.ContactPerson_Name}
                </h1>
              </div>
              <div className="button-div mb-2 mr-2">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-md font transition-colors w-full sm:w-auto mr-2"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md font transition-colors w-full sm:w-auto">
                  Approve
                </button>
              </div>
            </div>

            <div className="vs-top-bottom">
              <div className="m-0 flex flex-col lg:flex-row gap-4 lg:gap-[2%] w-full">
                <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[200px]">
                  <h2 className="text-xl font-bold mb-4 text-blue-800">
                    Entry Permit Request Details
                  </h2>

                  <div className="grid grid-cols-1 gap-2">
                    {/* Request Dep */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Requested Dep: <span className="text-red-600">*</span>
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
                                  Visits.Department_Id ===
                                  department.Department_Id
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
                          readOnly={false}
                          onChange={handleEntryPermitReq}
                          defaultValue={`${reqDate}`}
                          className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
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
                        Requested Officer:{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          readOnly={false}
                          name="Requested_Officer"
                          onChange={handleEntryPermitReq}
                          defaultValue={Visits.Requested_Officer}
                          className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
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
                        Visitor Category:{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="md:col-span-3">
                        <select
                          name="Visitor_Category"
                          onChange={handleEntryPermitReq}
                          className="text-sm bg-white border rounded border-slate-400 p-1 flex-1 w-full"
                          value={Visits.Visitor_Category}
                        >
                          {/* <option value="">{Visits.Visitor_Category}</option> */}
                          <option
                            selected={Visits.Visitor_Category === ""}
                            value=""
                          >
                            Select a Category
                          </option>
                          {Array.isArray(visitorCategory) &&
                            visitorCategory.map((vCategory) => (
                              <option
                                value={vCategory.visitor_category_id}
                                key={vCategory.visitor_category_id}
                                selected={
                                  vCategory.visitor_category_id ===
                                  Visits.Visitor_Category
                                }
                              >
                                {vCategory.visitor_category}
                              </option>
                            ))}
                          {/* <option
                            selected={Visits.Visitor_Category === "asdf"}
                            value=""
                          ></option> */}
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
                      <select
                        name="Purpose"
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        onChange={handleEntryPermit}
                        value={Visits.Purpose}
                      >
                        <option
                          value=""
                          selected={
                            Visits.Purpose === "" || Visits.Purpose === null
                          }
                        >
                          Select a Purpose
                        </option>

                        {/* <option value={Visits.Purpose}>{Visits.Purpose}</option> */}

                        {Array.isArray(visitorPurposes) &&
                          visitorPurposes.map((purpose) => (
                            <option
                              value={purpose.visiting_purpose_id}
                              key={purpose.visiting_purpose_id}
                              selected={
                                purpose.visiting_purpose_id == Visits.Purpose
                              }
                            >
                              {purpose.visiting_purpose}
                            </option>
                          ))}
                      </select>
                    </div>
                    {errors.Purpose && (
                      <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                        {errors.Purpose}
                      </p>
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
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="date"
                            readOnly={false}
                            name="Date_From"
                            onChange={handleEntryPermit}
                            defaultValue={reqDate}
                          />
                          {errors.DateFrm && (
                            <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                              {errors.DateFrm}
                            </p>
                          )}
                        </div>

                        <div className="flex-1">
                          <label className="text-sm">To</label>
                          <input
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="date"
                            readOnly={false}
                            name="Date_To"
                            onChange={handleEntryPermit}
                            defaultValue={dateTo >= today ? dateTo : null}
                          />
                          {errors.Date_To && (
                            <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                              {errors.Date_To}
                            </p>
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
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="time"
                            readOnly={false}
                            name="Time_From"
                            onChange={handleEntryPermit}
                            defaultValue={timeFrom}
                          />
                          {errors.Time_From && (
                            <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                              {errors.Time_From}
                            </p>
                          )}
                        </div>

                        <div className="flex-1">
                          <label className="text-sm">To</label>
                          <input
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="time"
                            readOnly={false}
                            name="Time_To"
                            onChange={handleEntryPermit}
                            defaultValue={timeTo}
                          />
                          {errors.Time_To && (
                            <p className="mt-1 text-sm text-red-600 bg-red-100 p-1 rounded">
                              {errors.Time_To}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* top-div end */}
              </div>

              {/* bottom div start*/}
              <div className="flex flex-col lg:flex-row lg:gap-[2%] w-full mt-5">
                <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px]">
                  <h1 className="font-bold text-lg text-blue-950 mb-2">
                    Person
                  </h1>

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
                          className="mr-1 scale-150"
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
                          className="mr-1 scale-150"
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
                          className="mr-1 scale-150"
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

                <div className="bg-blue-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[230px] mt-5 lg:mt-0">
                  <h1 className="font-bold text-lg text-blue-950 mb-2">
                    Vehicle
                  </h1>

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

                {/* top-div end */}
              </div>
              <div
                className={`${successOrError.type} === "error"? "error": "success"`}
              >
                {/* <h1>sadfasdf</h1> */}
                <p className="text-center mt-4 font-bold">
                  {successOrError.msg}
                </p>
              </div>
              <div className="text-center">
                <p className="error">{errorMessages}</p>
              </div>
              {/* <div className="button-div mb-2 mr-2">
                <button
                  className="mr-1.5 mb-1.5 btnBack"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
                <button className="mr-1.5 mb-1.5 btnSave">Approve</button>
              </div> */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HDisplayVisitor;
