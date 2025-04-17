import React, { useEffect, useState } from "react";
import "./SuddenVisit.css";
import {
  FaBicycle,
  FaCheck,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaPlusCircle,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";

const SuddenVisit = (userFactoryId) => {
  //to store csrf
  const [csrfToken, setCsrfToken] = useState("");
  const [departments, setDepartments] = useState({});
  const [validationErrorsS, setValidationErrorsS] = useState({});

  useEffect(() => {
    const factoryId = userFactoryId.userFactoryId;
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

    const fetchDepartments = async () => {
      // alert("getting departments");
      try {
        const response = await axios.get(
          `http://localhost:3000/department/getDep/${factoryId}`
        );
        if (response) {
          console.log(response);
          setDepartments(response.data);
        }
      } catch (error) {
        console.error(`error while sending request to back-end: ${error}`);
      }
    };
    fetchDepartments();
  }, []);

  const [visitorData, setVisitorData] = useState({
    visitorName: "",
    visitorNIC: "",
  });

  const [visitorsData, setVisitorsData] = useState([]);

  const handleVisitorData = (e) => {
    const { name, value } = e.target;

    setVisitorData({
      ...visitorData,
      [name]: value,
    });
  };

  const [visitorErrors, setVisitorErrors] = useState({
    visitorName: "",
    visitorNIC: "",
  });

  const handleVisitorPlusButton = () => {
    const { visitorName, visitorNIC } = visitorData;
    let errors = { ...visitorErrors };

    if (visitorName === "") {
      errors.visitorName = "Visitor name required";
    } else {
      if (!/^[A-Za-z\s]{3,255}$/.test(visitorName)) {
        errors.visitorName = "Name should only have letters";
      } else {
        delete errors.visitorName;
      }
    }

    if (visitorNIC === "") {
      errors.visitorNIC = "Visitor NIC required";
    } else {
      if (!/^[0-9]{0,9}[vV]$|^[0-9]{12}/) {
        errors.visitorNIC = "Invalid NIC format";
      } else {
        delete errors.visitorNIC;
      }
    }
    console.log(errors);
    // alert(Object.keys(errors).length);
    if (Object.keys(errors).length === 0) {
      setVisitorsData(() => [...visitorsData, { visitorName, visitorNIC }]);

      //clear the input box
      setVisitorData({
        visitorName: "",
        visitorNIC: "",
    });

      setVisitorErrors({
        visitorName: "",
        visitorNIC: "",
      });
    } else {
      setVisitorErrors(errors); // Directly set `errors` as the state value
    }

    
  };

  // Function to remove a specific visitor from the list
  const removeItem = (index) => {
    setVisitorsData((prevVisitors) =>
      prevVisitors.filter((visitor, i) => i !== index)
    );
  };

  //state to store entry permit request details
  const [entryRequest, setEntryRequest] = useState({
    reqDept: "",
    reqDate: "",
    reqOfficer: "",
    visitorCategory: "",
  });

  // to handle changes of entry permit request
  const handleEntryRequest = (e) => {
    const { name, value } = e.target;
    validateData(name, value);
    setEntryRequest({
      ...entryRequest,
      [name]: value,
    });
  };

  // to store entry permit details
  const [entryPermit, setEntryPermit] = useState({
    purpose: "",
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
  });

  //to handle changes of entry permit
  const handleEntryPermit = (e) => {
    const { name, value } = e.target;
    if (name === "timeFrom") {
      //disable time to if time from is empty
      setDisableTimeTo(false);
    }
    validateData(name, value);
    setEntryPermit({
      ...entryPermit,
      [name]: value,
    });
  };

  //to store meal plan details
  const [mealplan, setMealplan] = useState({
    breakfast: "",
    lunch: "",
    tea: "",
    aditionalNote: "",
  });

  // to handle meal plan details
  const handleMealplan = (e) => {
    const { name, value } = e.target;
    validateData(name, value);
    setMealplan({
      ...mealplan,
      [name]: value,
    });
  };

  //to disable date to
  const [disableTimeTo, setDisableTimeTo] = useState(true);

  //to client side validations
  const [validationErrors, setValidationErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];
  // alert(today);
  const validateData = (name, value) => {
    let errors = { ...validationErrors };
    switch (name) {
      case "reqDept":
        // requested department validation
        if (value.trim() === "") {
          errors.reqDept = "Please select a department";
        } else {
          delete errors.reqDept;
        }
        break;

      case "reqDate":
        if (value.trim() === "") {
          errors.reqDate = "Please select a date";
        } else if (value <= today) {
          errors.reqDate = "You cannot select past dates";
        } else {
          delete errors.reqDate;
        }
        break;

      case "reqOfficer":
        if (value.trim() === "") {
          errors.reqOfficer = "Officer name required";
        } else if (!/^[A-Za-z\s]{3,255}$/.test(value)) {
          errors.reqOfficer = "Invalid name format";
        } else {
          delete errors.reqOfficer;
        }
        break;

      case "visitorCategory":
        if (value.trim() === "") {
          errors.visitorCategory = "Please select a visitor category";
        } else {
          delete errors.visitorCategory;
        }
        break;

      case "purpose":
        if (value.trim() === "") {
          errors.purpose = "Please select visit purpose";
        } else {
          delete errors.purpose;
        }
        break;

      case "dateFrom":
        if (value.trim() === "") {
          errors.dateFrom = "Please select a from date";
        } else if (value <= today) {
          errors.dateFrom = "Past dates for 'from' date";
        } else {
          delete errors.dateFrom;
        }
        break;

      case "dateTo":
        if (value.trim() === "") {
          errors.dateTo = "Please select a to date";
        } else if (value <= (entryPermit.dateFrom || today)) {
          errors.dateTo = "Past dates for 'to' date";
        } else {
          delete errors.dateTo;
        }
        break;

      case "timeFrom":
        if (value.trim() === "") {
          errors.timeFrom = "Please select time when the visit started";
        } else {
          delete errors.timeFrom;
        }
        break;

      case "timeTo":
        if (value.trim() !== "") {
          if (value <= entryPermit.timeFrom) {
            errors.timeTo = "Time cannot be in past";
          } else {
            delete errors.timeTo;
          }
        } else {
          delete errors.timeTo;
        }
        break;

      default:
        break;
    }

    // Update validation errors state
    setValidationErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // alert("submitting")
    let formData = {
      userFactoryId: userFactoryId,
      entryRequest: entryRequest,
      entryPermit: entryPermit,
      visitorsData: visitorsData,
      mealplan: mealplan,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/visitor/createSuddenvisit",
        formData,
        {
          headers: { "x-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      // If the response is successful, you can reset errors or do other things
      console.log(response.data); // Process the successful response
      setValidationErrorsS({ success: "visit creation success" });
      alert("Visit creation success");
    } catch (error) {
      // alert("errors found");
      if (error.response) {
        // If validation errors are present, they will be inside error.response.data.errors
        setValidationErrorsS(error.response.data.errors);
        console.log(error.response.data.errors);
        // alert("errors found1");
      } else {
        // For other errors (network error, etc.)
        setErrorMessage(
          "An error occurred while submitting the form. Please try again later."
        );
      }
    }
  };

  return (
    <div className="sv-containers" style={{backgroundColor: "#e3dede"}}>
      <form onSubmit={handleSubmit}>
        <div className="">
          <h1 className="sv-title">
            Sudden Visit application for BOI entry permits (Internal)
          </h1>
        </div>

        <div className="sv-buttons mt-7 text-right">
          <button
            type="submit"
            className="mr-5 bg-green-700 text-white py-1.5 px-6 mr-2 rounded-md hover:bg-green-800 mb-5"
          >
            Save
          </button>
        </div>

        <div className="w-full">
          <div className="sd-top">
            {/* top left */}
            <div className="sd-left">
              <h1 className="sub-tpks">Entry permit request details</h1>
              <table className="sv-tblInput">
                <tbody>
                  <tr>
                    <td className="flex justify-start items-start">
                      <label htmlFor="">Requested Dept: </label>
                    </td>
                    <td>
                      <p className="error">
                        {validationErrors.reqDept && validationErrors.reqDept}
                      </p>
                      <select
                        name="reqDept"
                        onChange={handleEntryRequest}
                        className="sv-input sv-select"
                        id=""
                      >
                        <option value="">Select a Department</option>
                        {Array.isArray(departments) &&
                          departments.map((department) => {
                            return (
                              <option
                                key={department.Department_Id}
                                value={department.Department_Id}
                              >
                                {department.Department_Name}
                              </option>
                            );
                          })}
                      </select>
                    </td>
                  </tr>

                  <tr>
                    <td className="flex justify-start items-start">
                      <label htmlFor="">Requested Date: </label>
                    </td>
                    <td>
                      <p className="error">
                        {validationErrors.reqDate && validationErrors.reqDate}
                      </p>
                      <input
                        type="Date"
                        className="sv-input"
                        name="reqDate"
                        onChange={handleEntryRequest}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="flex justify-start items-start">
                      <label htmlFor="">Requested Officer:</label>
                    </td>
                    <td>
                      <p className="error">
                        {validationErrors.reqOfficer &&
                          validationErrors.reqOfficer}
                      </p>
                      <input
                        type="text"
                        className="sv-input"
                        name="reqOfficer"
                        onChange={handleEntryRequest}
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="flex justify-start items-start">
                      <label htmlFor="">Visitor Category: </label>
                    </td>
                    <td>
                      <p className="error">
                        {validationErrors.visitorCategory &&
                          validationErrors.visitorCategory}
                      </p>
                      <select
                        className="sv-input sv-select cursor-default"
                        name="visitorCategory"
                        onChange={handleEntryRequest}
                        id=""
                      >
                        <option value="">Select visitor Category</option>
                        <option value="HR services">HR Services</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              {/* <p>{validationErrors}</p> */}
            </div>

            {/* top right */}
            <div className="sd-right">
              <h1 className="sub-tpks">Entry permit details</h1>
              <table>
                <tr>
                  <td className="w-1/3 ml-3 flex justify-start items-start flex justify-start items-start">
                    <label htmlFor="">Purpose: </label>
                  </td>
                  <td>
                    <p className="error">
                      {validationErrors.purpose && validationErrors.purpose}
                    </p>
                    <select
                      name="purpose"
                      onChange={handleEntryPermit}
                      className="sv-input sv-select ml-2"
                      id=""
                    >
                      <option value="">Select a purpose</option>
                      <option value="Hr Services">Hr Services</option>
                      <option value="Government Services">
                        Government Services
                      </option>
                    </select>
                  </td>
                </tr>
              </table>

              {/* date and time details */}
              <table className="mt-2">
                <tr>
                  <td></td>
                  <td>From</td>
                  <td>To</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>
                    <p className="error">
                      &nbsp;
                      {validationErrors.dateFrom && validationErrors.dateFrom}
                    </p>
                    <input
                      type="date"
                      className="sv-input sv-date"
                      name="dateFrom"
                      onChange={handleEntryPermit}
                      id=""
                    />
                  </td>
                  <td>
                    <p className="error">
                      &nbsp;{validationErrors.dateTo && validationErrors.dateTo}
                    </p>
                    <input
                      type="date"
                      className="sv-input sv-date"
                      name="dateTo"
                      onChange={handleEntryPermit}
                      id=""
                    />
                  </td>
                </tr>

                <tr>
                  <td>Time:</td>
                  <td>
                    <p className="error">
                      &nbsp;
                      {validationErrors.timeFrom && validationErrors.timeFrom}
                    </p>
                    <input
                      type="time"
                      className="sv-input sv-date"
                      name="timeFrom"
                      onChange={handleEntryPermit}
                      id=""
                    />
                  </td>
                  <td>
                    <p className="error">
                      &nbsp;{validationErrors.timeTo && validationErrors.timeTo}
                    </p>
                    <input
                      type="time"
                      className="sv-input sv-date"
                      name="timeTo"
                      disabled={disableTimeTo}
                      onChange={handleEntryPermit}
                      id=""
                    />
                  </td>
                </tr>
              </table>
            </div>
          </div>

          {/* bottom */}
          <div className="sd-bottom">
            {/* Visitor Details */}
            <div className="sd-right">
              <h1 className="sub-tpks">Visitor Details</h1>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="">
                        <label htmlFor="">Name: </label>
                        <p className="error">
                          &nbsp;{" "}
                          {visitorErrors.visitorName &&
                            visitorErrors.visitorName}
                        </p>
                        <input
                          name="visitorName"
                          value={visitorData.visitorName}
                          onChange={handleVisitorData}
                          className="py-1 pl-1 rounded-md sv-visitorData"
                          type="text"
                        />
                      </div>
                    </td>

                    <td>
                      <div className="">
                        <label htmlFor="">NIC: </label>
                        <p className="error">
                          &nbsp;{" "}
                          {visitorErrors.visitorNIC && visitorErrors.visitorNIC}
                        </p>
                        <input
                          name="visitorNIC"
                          value={visitorData.visitorNIC}
                          onChange={handleVisitorData}
                          className="py-1 pl-1 rounded-md sv-visitorData"
                          type="text"
                        />
                      </div>
                    </td>
                    <td
                      className="sv-icons cursor-pointer text-2xl float-start"
                      style={{ width: "1%" }}
                    >
                      <FaPlusCircle onClick={handleVisitorPlusButton} />
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full mt-3">
                <thead>
                  <th style={{ textAlign: "center" }}>Name</th>
                  <th style={{ textAlign: "center" }}>NIC</th>
                </thead>

                <tbody>
                  {Array.isArray(visitorsData) &&
                    visitorsData.length > 0 &&
                    visitorsData.map((visitor, index) => (
                      <tr key={index}>
                        <td
                          style={{
                            border: "1px solid black",
                            textAlign: "",
                            width: "50%",
                          }}
                        >
                          {visitor.visitorName}
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            textAlign: "",
                            width: "48%",
                          }}
                        >
                          {visitor.visitorNIC}
                        </td>
                        <td style={{ width: "1%" }}>
                          <MdDelete
                            onClick={() => removeItem(index)}
                            className="hover:text-red-600 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* right div */}
            <div className="sd-right">
              <h1 className="sub-tpks">Meal plan</h1>
              &nbsp;
              <div className="">
                <input
                  type="checkbox"
                  name="breakfast"
                  onChange={handleMealplan}
                  className="sv-checkboxes"
                />{" "}
                <span className="sv-span">Breakfast</span>
                <input
                  type="checkbox"
                  className="sv-checkboxes"
                  onChange={handleMealplan}
                  name="lunch"
                  id=""
                />{" "}
                <span className="sv-span">Lunch</span>
                <input
                  type="checkbox"
                  onChange={handleMealplan}
                  className="sv-checkboxes"
                  name="tea"
                  id=""
                />{" "}
                <span className="sv-span">Tea</span>
              </div>
              <div className="">
                <h3 className="mt-3 text-black">Additional Note: </h3>
                <textarea
                  cols="30"
                  rows="4"
                  name="additionalNote"
                  onChange={handleMealplan}
                  id=""
                  className="sv-textarea"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="success text-center font-bold mt-12">
          {validationErrorsS.success && (
            <div className="text-center">
              {validationErrorsS.success}
            </div>
          )}
        </div>

        <div className="error text-center px-8 font-bold">
          {Object.keys(validationErrorsS).map((field) => (
            <span key={field}>
              {validationErrorsS[field].msg !== "" ? " " : ""}
              {validationErrorsS[field].msg}&nbsp;&nbsp;{" "}
            </span>
          ))}
        </div>
        {/* <div className="sv-buttons mt-7 text-right">
          <button
            type="submit"
            className="mr-2 bg-green-700 text-white py-1.5 px-6 mr-2 rounded-md hover:bg-green-800 mb-5"
          >
            Save
          </button>
        </div> */}
      </form>
    </div>
  );
};

export default SuddenVisit;
