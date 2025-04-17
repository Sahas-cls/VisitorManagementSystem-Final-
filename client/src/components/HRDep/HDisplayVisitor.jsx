import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
// import CSidebar from "./CSidebar";
import "./HDisplayVisitor.css";
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

    // disabling all input fields
    const inputBoxes = document.querySelectorAll(
      ".cdInput, .select-input, .text-area"
    );
    inputBoxes.forEach((input) => {
      input.readOnly = true;
    });

    const selectBoxes = document.querySelectorAll(".select-input");
    selectBoxes.forEach((input) => {
      input.disabled = true;
    });
  }, []);

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
            alert("Update success");
            successOrError = {
              type: "success",
              msg: "Visitor Updated Successfully",
            };
          } else if (response.status === 500) {
            successOrError = {
              type: "error",
              msg: "Visitor update failed with error code 500",
            };
          } else {
            successOrError = {
              type: "error",
              msg: "Unknown error occurred",
            };
          }
        }
      } catch (error) {
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
    <div>
      {/* <h1>user factory id: {userFactoryId || null}</h1> */}
      <form onSubmit={handleSubmit}>
        <Header
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
        />
        <div className="flex bg-green-400">
          {/* <CSidebar /> */}
          <div className="vs-containers" style={{ backgroundColor: "white" }}>
            <div className="ml-5 rounded-m flex justify-between">
              <div className="flex">
                <FaPersonCircleExclamation className="lg:text-5xl md:text-5xl sm:text-3xl hd-visitor-icon" />
                <h1 className="visitor-name" style={{ fontSize: "1.5rem" }}>
                  <span className="text-sky-700">
                    {Visitor.ContactPerson_Name}
                  </span>
                </h1>
              </div>

              <div className="button-div mb-2 mr-2">
                <button
                  className="mr-1.5 mb-1.5 btnBack"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
                <button className="mr-1.5 mb-1.5 btnSave">Approve</button>
              </div>
            </div>

            <div className="vs-top-bottom">
              <div className="vs-top ">
                <div className="vs-top-left h-sub-div">
                  <h1 className="font-bold mb-1">
                    Entry Permit Request Details
                  </h1>
                  <table>
                    <tr>
                      <td>
                        <label htmlFor="">
                          Request Dep: <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td>
                        <select
                          name="Requested_Department"
                          className="select-input"
                          onChange={handleEntryPermitReq}
                          id=""
                        >
                          <option value="">Select a Department:</option>
                          {/* get all departments to here */}
                          {Array.isArray(departmentList) &&
                            departmentList.map((department) => {
                              return (
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
                              );
                            })}
                        </select>
                        {errors.Requested_Department && (
                          <p className="error">{errors.Requested_Department}</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="">
                          Requested Date:{" "}
                          <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td>
                        <input
                          type="date"
                          name="Date_From"
                          readOnly="true"
                          onChange={handleEntryPermitReq}
                          className="cdInput"
                          defaultValue={`${reqDate}`}
                        />
                        {errors.Date_From && (
                          <p className="error">{errors.Date_From}</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="">
                          Requested Officer:{" "}
                          <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td>
                        <input
                          className="cdInput"
                          readOnly="true"
                          name="Requested_Officer"
                          onChange={handleEntryPermitReq}
                          defaultValue={Visits.Requested_Officer}
                          type="text"
                        />
                        {errors.Requested_Officer && (
                          <p className="error">{errors.Requested_Officer}</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="">
                          Visitor Category:{" "}
                          <span className="text-red-600">*</span>
                        </label>
                      </td>
                      {/* {alert(Visits.Visitor_Category)} */}
                      <td>
                        <select
                          name="Visitor_Category"
                          className="select-input"
                          onChange={handleEntryPermitReq}
                          id=""
                        >
                          <option
                            selected={Visits.Visitor_Category === ""}
                            value=""
                          >
                            Select a Category
                          </option>
                          <option
                            selected={Visits.Visitor_Category == "HR Services"}
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
                          <option
                            selected={Visits.Visitor_Category === "asdf"}
                            value=""
                          ></option>
                        </select>
                        {errors.Visitor_Category && (
                          <p className="error">{errors.Visitor_Category}</p>
                        )}
                      </td>
                    </tr>
                  </table>
                  {/* top-left div end */}
                </div>

                <div className="vs-top-right h-sub-div">
                  <h1 className="font-bold mb-1">Entry permit Details</h1>
                  <table>
                    <tr>
                      <td>
                        <label htmlFor="">
                          Purpose: <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td>
                        <select
                          name="Purpose"
                          className="select-input"
                          id=""
                          onChange={handleEntryPermit}
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
                        {errors.Purpose && (
                          <p className="error">{errors.Purpose}</p>
                        )}
                      </td>
                    </tr>

                    <tr className="">
                      <td className="">
                        <label htmlFor="">
                          Date: <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td className="flex gap-32">
                        <label htmlFor="">From</label>
                        <label htmlFor="" className="ml-5">
                          To
                        </label>
                      </td>
                    </tr>

                    <tr>
                      <td></td>
                      <td className="flex gap-8">
                        <div className="">
                          <input
                            className="cdInput"
                            type="date"
                            readOnly="true"
                            name="Date_From"
                            onChange={handleEntryPermit}
                            defaultValue={reqDate}
                          />
                          {errors.DateFrm && (
                            <p className="error">{errors.DateFrm}</p>
                          )}
                        </div>

                        <div className="">
                          <input
                            className="cdInput"
                            readOnly="true"
                            type="date"
                            name="Date_To"
                            onChange={handleEntryPermit}
                            defaultValue={dateTo >= today ? dateTo : null}
                          />
                          {errors.Date_To && (
                            <p className="error">{errors.Date_To}</p>
                          )}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="">
                          Time: <span className="text-red-600">*</span>
                        </label>
                      </td>
                      <td className="flex gap-24" style={{ gap: "92px" }}>
                        <div className="flex flex-col">
                          <input
                            className="cdInput"
                            type="time"
                            readOnly="true"
                            name="Time_From"
                            onChange={handleEntryPermit}
                            defaultValue={timeFrom}
                          />
                          {errors.Time_From && (
                            <p className="error">{errors.Time_From}</p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <input
                            className="cdInput"
                            type="time"
                            readOnly="true"
                            name="Time_To"
                            onChange={handleEntryPermit}
                            defaultValue={timeTo}
                          />
                          {errors.Time_To && (
                            <p className="error">{errors.Time_To}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>

                {/* top-div end */}
              </div>

              {/* bottom div start*/}
              <div className="vs-top">
                <div className="vs-top-left h-sub-div">
                  <h1 className="font-bold mb-1">Person</h1>
                  <table className="w-full tblVisitors">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>NIC</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Array.isArray(visitorGroup) &&
                        visitorGroup.map((visitor) => {
                          return (
                            <tr key={visitor.Visitor_Id}>
                              <td>{visitor.Visitor_Name}</td>
                              <td>{visitor.Visitor_NIC}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  <div className="mt-3">
                    <h3>Meal Plan: </h3>
                    <tr>
                      <td>
                        <input
                          className="cdInputChk"
                          type="checkbox"
                          // readOnly="true"
                          name="Breakfast"
                          onChange={handlePerson}
                          checked={Visits.Breakfast === true}
                          id=""
                        />{" "}
                        <span>Breakfast</span>
                      </td>
                      <td>
                        <input
                          className="cdInputChk"
                          type="checkbox"
                          name="Lunch"
                          onChange={handlePerson}
                          checked={Visits.Lunch === true}
                        />
                        <span>Lunch</span>
                      </td>
                      <td>
                        <input
                          className="cdInputChk"
                          type="checkbox"
                          name="Tea"
                          onChange={handlePerson}
                          // checked={Visits.Tea === true}
                          checked={Visits.Tea === true}
                          id=""
                        />
                        <span>Tea</span>
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="2">
                        <h3>Additional Note</h3>
                        <textarea
                          rows="4"
                          type="text"
                          name="Remark"
                          className="text-area"
                          onChange={handlePerson}
                          id=""
                          style={{ cursor: "pointer" }}
                          defaultValue={Visits.Remark}
                        ></textarea>
                      </td>
                    </tr>
                  </div>

                  {/* top-left div end */}
                </div>

                <div className="vs-top-right h-sub-div">
                  <h1 className="font-bold mb-1">Vehicle</h1>
                  <table className="w-full tblVisitors">
                    <thead>
                      <th>Vehicle Type</th>
                      <th>Vehicle No</th>
                    </thead>

                    <tbody>
                      {Array.isArray(Vehicles) &&
                        Vehicles.map((vehicle) => {
                          return (
                            <tr key={vehicle.Vehicle_Id}>
                              <td>{vehicle.Vehicle_No}</td>
                              <td>{vehicle.Vehicle_Type}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
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
