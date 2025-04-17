import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
// import CSidebar from "./CSidebar";
import "./RDisplayVisitor.css";
import axios from "axios";
import { IoIosSave, IoIosSend } from "react-icons/io";
import { FaPlusCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import "./RContainer.css";

const RDisplayVisitor = () => {
  const location = useLocation();
  const visitor = location.state?.visitor; // Access the passed visitor data

  console.log(
    "All details: ======================================================"
  );
  console.log(location.state);

  console.log("state", location.state);
  console.log("visitor ======", visitor);

  // const visitorEmail = visitor.ContactPerson_Email || null;
  //destructuring data
  const contactPersonEmail = visitor.ContactPerson_Email || "";
  const contactPersonMNo = visitor.ContactPerson_ContactNo;
  // console.log("contact person email: " + contactPersonEmail);

  const Visitor = location.state?.visitor; //this is the details of contact person
  const [visitorGroup, setVisitorGroup] = useState(
    location.state?.visitor.Visitors
  ); // the visitors group coming with contact person
  const UserData = location.state?.userData; //this is the details about current logged in user
  const [Vehicles, setVehicles] = useState(location.state?.visitor.Vehicles); //this is the details about vehicels
  const Visits = location.state?.visitor.Visits[0]; //this is the variable that store visit details

  console.log("visits", Visits.Requested_Officer);

  console.log("user data from display data: ", UserData);
  // alert(Visits);

  console.log("visitors", visitor);
  console.log("visitor group", visitorGroup);
  console.log("vehicle group", Vehicles);

  const { userName, userCategory, userDepartment, userId } = UserData;
  const [departmentList, setDepartmentList] = useState({});
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState();
  const [serverErroors, setServerErrors] = useState({});
  const [vehicleErrors, setVehicleErrors] = useState({});

  const navigate = useNavigate();

  const navigateTo = () => {
    // alert("clicked");
    // Navigate to /editVisitor and pass the clicked visitor's data as state
    navigate("/edit-visit-recept", {
      state: { visitor: visitor },
    });
  };

  // const naviateTo = ()=>{
  //   navigate(-1)
  // }

  // const [vehicles, setVehicles] = useState({});

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

  const handlePersonPlus = (e) => {
    e.preventDefault();
    console.log("Visitor list", visitorGroup);
    return;
    setVisitorGroup(...visitorGroup, { Name: "", NIC: "" });
  };
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
          // alert(csrf)
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
          "http://localhost:3000/visitor/getDepartments",
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
  let successOrError = { type: "", msg: "" };

  const [entryPermitReference, setEntryPermitReference] = useState({
    refNumber: "",
    issuedDate: "",
  });

  const handleRefChanges = (e) => {
    const { name, value } = e.target;
    setEntryPermitReference({
      ...entryPermitReference,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // alert("sending request");
    let formData = {
      userId: userId,
      Visit_Id: VisitId,
      Reference_Details: entryPermitReference,
    };

    if (Object.keys(errorObj).length === 0) {
      try {
        // alert("sending request");
        const response = await axios.post(
          "http://localhost:3000/visitor/updateVisitors-reception",
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
        alert("error");
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

  //disabling input boxes
  // const inputBoxes = document.querySelectorAll(".cdInput");
  // inputBoxes.forEach((input) => {
  //   input.readOnly = true;
  // });

  // const selectBoxes = document.querySelectorAll(".c-select");
  // selectBoxes.forEach((selectBox) => {
  //   selectBox.disabled = true;
  // });

  //to disable save button until click on send msg button
  const [disableSave, setDisableSave] = useState(true);
  const disableSaveButton = (e) => {
    e.preventDefault();
    setDisableSave(false);
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    try {
      const response = axios.post(
        "http://localhost:3000/visitor/update-visit-reception",
        () => {}
      );
    } catch (error) {}
  };

  const [emailSuccessMsg, setEmailSuccessMsg] = useState();
  const [serverSideErrors, setServerSideErrors] = useState({});
  const [recMessages, setRecMessages] = useState();
  const handleSendEmail = async (e) => {
    let formData = {
      userId: userId,
      Visit_Id: VisitId,
      Reference_Details: entryPermitReference,
    };
    e.preventDefault();
    console.log(contactPersonEmail);
    // alert(contactPersonEmail);
    if (contactPersonEmail !== "" && contactPersonEmail !== null) {
      try {
        const response = await axios.post(
          "http://localhost:3000/visitor/sendEmail",
          { formData: formData, contactPersonEmail: contactPersonEmail },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          alert("Email sent successfully");
          setRecMessages(""); // Reset any other messages
          setServerSideErrors(""); // Clear any previous errors
          setEmailSuccessMsg("Email sent successfully");
        }
      } catch (error) {
        console.log(error);

        if (error.response) {
          // Check if the response has validation errors
          if (error.response.data && error.response.data.errors) {
            const errorMessages = error.response.data.errors
              .map((err) => err.msg)
              .join("* ");

            // Set server-side validation errors in the state
            setServerSideErrors(errorMessages);
          } else {
            // Handle other errors (like network issues, server down, etc.)
            setServerSideErrors(
              "Mail sending failed. Please send the reference number to the user via mobile."
            );
          }
        } else {
          // If no response (network error, etc.), handle it here
          setServerSideErrors("An unknown error occurred.");
        }

        console.error(error);
        alert("Contact person email cannot be found");
      }
    } else {
      alert("Contact person's email doesn't provided");
      setRecMessages(
        `The selected users email address is cannot be found, please send him reference number using his mobile number ${contactPersonMNo}`
      );
    }
  };
  const vehicleError = useState();
  const handleVehiclePlus = () => {
    const { VehicleNo, VehicleType } = Vehicles[Vehicles.length - 1];
    // alert(VehicleNo);

    if (!VehicleNo) {
      vehicleError.VehicleNo = "Vehicle no required*";
    } else {
      delete vehicleError.VehicleNo;
    }

    if (!VehicleType) {
      vehicleError.VehicleType = "Vehicle type required*";
    } else {
      delete vehicleError.VehicleType;
    }

    // alert("v Errors " + Object.keys(vehicleError));
    setVehicleErrors(vehicleError);

    // alert(Object.keys(vehicleError).length);
    alert("plus vehicle");
    const newVehicle = [...Vehicles, { VehicleNo: "", VehicleType: "" }];
    setVehicles(newVehicle);
    if (Object.keys(vehicleError).length === 0) {
    }
    // alert("adding vehicle");
  };

  const removeVisitor = (e, index) => {
    alert(index);
    e.preventDefault();
    const updatedVisitors = visitorGroup.filter((_, i) => i !== index);
    setVisitorGroup(updatedVisitors);
  };

  const removeVehicle = (e, index) => {
    e.preventDefault();

    // console.log("Removing vehicle at index:", index); // Debugging line

    // Create a new array of vehicles excluding the vehicle at the given index
    const updatedVehicles = vehicles.filter((_, i) => i !== index);

    // console.log("Updated vehicles:", updatedVehicles); // Debugging line
    // console.log(updatedVehicles);
    // Update the state with the new list of vehicles
    setVehicles(updatedVehicles);

    // Optional: Remove the vehicle's error from the errors state (if needed)
    const updatedErrors = { ...vehicleErrors };
    delete updatedErrors[index];
    setVehicleErrors(updatedErrors);
  };

  return (
    <div className="rrContainer flex flex-col">
      <form>
        <Header
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
        />
        <div className="flex">
          {/* <CSidebar /> */}
          <div className="vs-containers">
            <h1 className="visitor-name">
              Contact person's name: {Visitor.ContactPerson_Name}
            </h1>

            <div className="vs-top-bottom">
              <div className="vs-top">
                <div className="vs-top-left">
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
                          className="c-select"
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
                          // onChange={handleEntryPermitReq}
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
                          name="Requested_Officer"
                          // onChange={handleEntryPermitReq}
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
                          className="c-select"
                          // onChange={handleEntryPermitReq}
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

                <div className="vs-top-right">
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
                          className="c-select"
                          id=""
                          // onChange={handleEntryPermit}
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

                    <tr>
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
                            name="Date_From"
                            // onChange={handleEntryPermit}
                            defaultValue={reqDate}
                          />
                          {errors.DateFrm && (
                            <p className="error">{errors.DateFrm}</p>
                          )}
                        </div>

                        <div className="">
                          <input
                            className="cdInput"
                            type="date"
                            name="Date_To"
                            // onChange={handleEntryPermit}
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
                            name="Time_From"
                            // onChange={handleEntryPermit}
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
                            name="Time_To"
                            // onChange={handleEntryPermit}
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
                <div className="vs-top-left">
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
                              <td style={{ border: "0" }} className="">
                                <FaPlusCircle
                                  className="vf-icon hover:text-green-600"
                                  onClick={handlePersonPlus} // Your existing logic for adding a vehicle
                                />
                                <MdDelete
                                  onClick={(e) => removeVehicle(e, index)} // Correctly pass index for removal
                                  className="vf-icon hover:text-red-600"
                                />
                              </td>
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
                          name="Breakfast"
                          // onChange={handlePerson}
                          defaultChecked={Visits.Breakfast === true}
                          id=""
                        />{" "}
                        <span>Breakfast</span>
                      </td>
                      <td>
                        <input
                          className="cdInputChk"
                          type="checkbox"
                          name="Lunch"
                          // onChange={handlePerson}
                          defaultChecked={Visits.Lunch === true}
                        />
                        <span>Lunch</span>
                      </td>
                      <td>
                        <input
                          className="cdInputChk"
                          type="checkbox"
                          name="Tea"
                          // onChange={handlePerson}
                          // checked={Visits.Tea === true}
                          defaultChecked={Visits.Tea === true}
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
                          // onChange={handlePerson}
                          id=""
                          defaultValue={Visits.Remark}
                          readOnly={true}
                        ></textarea>
                      </td>
                    </tr>
                  </div>

                  {/* top-left div end */}
                </div>

                <div className="vs-top-right">
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
                {/* add success message */}
                {/* {alert(successOrError.msg)} */}
                {/* {console.log(successOrError.msg)} */}
                <p className="text-center mt-4 font-bold">
                  {successOrError.msg}
                </p>
              </div>
              <div className="text-center">
                <p className="error">{errorMessages}</p>
              </div>
              {/* <div className="button-div">
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

      <div className="bg-gray-300" style={{backgroundColor: "#e3dede", margin:"0px", borderTop:"0px"}}>
        <div className="w-full rd-entryReference" style={{ margin: "10px auto" }}>
          <div className="text-center text-xl font-bold mb-8">
            <h1>Entry permit Reference & Issue</h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex justify-center items-center">
              <table className="mb-4">
                <tr>
                  <td className="">
                    <label className="rlabels" htmlFor="">
                      Reference Number:{" "}
                    </label>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="refNumber"
                      className="recInput mb-3"
                      onChange={handleRefChanges}
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <label className="rlabels" htmlFor="">
                      Issued Date:{" "}
                    </label>
                  </td>
                  <td>
                    <input
                      type="Date"
                      name="issuedDate"
                      onChange={handleRefChanges}
                      className="recInput"
                    />
                  </td>
                </tr>
              </table>

              <div className="buttons text-center flex justify-center gap-4">
                <button
                  className="rbuttons text-center px-4 flex"
                  onClick={disableSaveButton}
                >
                  <IoIosSend className="rIcons" onClick={handleSendEmail} />
                  <p>Send msg</p>
                </button>
                <button
                  disabled={disableSave}
                  className="rbuttons text-center px-4 flex"
                  onClick={handleSubmit}
                >
                  <IoIosSave className="rIcons" />
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="">
          {emailSuccessMsg && (
            <p className="success font-bold">
              {typeof emailSuccessMsg === "object"
                ? JSON.stringify(emailSuccessMsg)
                : emailSuccessMsg}
            </p>
          )}
          {serverSideErrors && (
            <p className="error font-bold">
              {typeof serverSideErrors === "object"
                ? JSON.stringify(serverSideErrors)
                : serverSideErrors}
            </p>
          )}
          {recMessages && (
            <p className="text-blue-600 font-bold">
              {typeof recMessages === "object"
                ? JSON.stringify(recMessages)
                : recMessages}
            </p>
          )}
        </div>

        <div className="text-right w-full mb-6">
          <button
            onClick={navigateTo}
            className="bg-green-600 mt-10 mr-3 py-1.5 px-7 rounded-md text-white hover:bg-green-800 shadow-lg"
          >
            Update
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-blue-600 mt-10 mr-3 py-1.5 px-7 rounded-md text-white hover:bg-blue-800 shadow-lg"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default RDisplayVisitor;
