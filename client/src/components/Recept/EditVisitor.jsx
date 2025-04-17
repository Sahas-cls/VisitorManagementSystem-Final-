import React, { useState, useEffect } from "react";
import { FaKiss, FaPlusCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./VisitorF.css";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import swal from "sweetalert2";

const EditVisitor = () => {
  const location = useLocation();
  const visitorData = location.state?.visitor;
  const {
    ContactPerson_ContactNo,
    ContactPerson_Email,
    ContactPerson_Id,
    ContactPerson_NIC,
    ContactPerson_Name,
  } = visitorData;

  const [contactPerson, setContactPerson] = useState({
    cId: ContactPerson_Id,
    cName: ContactPerson_Name || "",
    cNIC: ContactPerson_NIC || "",
    cMobileNo: ContactPerson_ContactNo || "",
    cEmail: ContactPerson_Email || "",
  });

  const { Date_From, Date_To, Time_From, Time_To } =
    location.state?.visitor?.Visits[0];

  // const dateFrom = new Date(Date_From).toLocaleDateString("en-GB");
  const dateTo = new Date(Date_To).toISOString().split("T")[0];
  const dateFrom = new Date(Date_From).toISOString().split("T")[0];
  // const timeTo = new Date(Time_To).toISOString().split("T")[1];

  const [dateTime, setDateTime] = useState({
    dateFrom: dateFrom || "",
    dateTo: dateTo || "",
    fTimeFrom: Time_From || "",
    fTimeTo: Time_To || "",
  });

  // console.log("date from ================", timeTo);

  console.log(ContactPerson_Name);
  const vehicleDetails = location.state?.visitor?.Vehicles;

  console.log("all vehicles ==============", vehicleDetails);

  console.log("============ all visitors =============", visitorData);

  const [csrfToken, setCsrfToken] = useState("");

  const [vehiclesState, setVehiclesState] = useState(
    location.state?.visitor.Vehicles
  );

  const navigate = useNavigate();
  const [errorsCPerson, setErrorsCPerson] = useState({});
  const [successMessage, setSuccessMessage] = useState({});
  const [errorMessages, setErrorMessages] = useState();
  const [visitorList, setVisitorList] = useState();
  const [departmentList, setDepartmentList] = useState({});
  let errorMessage = ""; //to store errors from server side
  const [factories, setFactories] = useState({}); //to store all factories
  const [departments, setDepartments] = useState({}); //to soter all departments according to the factory
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  // !to get all factory details
  const getFactories = async () => {
    // alert("getting factories");
    try {
      // alert(csrfToken);
      // alert("sending factory request");
      const response = await axios.get(
        "http://localhost:3000/department/getAll-Factories",
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      if (response) {
        setFactories(response.data.data);
      } else {
        alert("response failed");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // !to get factory details
  const fetchDepartments = async (e) => {
    const factoryId = e.target.value; //to fetch departments according to selected factory
    // alert(factoryId);
    // return
    try {
      const response = await axios.get(
        `http://localhost:3000/department/getDep/${factoryId}`
      );
      if (response) {
        // setDepartments(response.data);
        setDepartments(response.data);
      }
    } catch (error) {
      console.error(`error while sending request to back-end: ${error}`);
    }
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response.status === 200) {
          // console.log("csrf" + response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          // console.log(csrf);
          // alert("csrf token" + response.data.csrfToken);
          setCsrfToken(csrf);
        } else {
          response.data.error;
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

    //to get department details
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
          // console.log(visitorList.data.data);
          setDepartmentList(visitorList.data.data);
        }
      } catch (error) {
        setErrorMessages(error.message);
      }
    };
    getDepartments();

    // ?================================================
    getFactories();
  }, []);

  const [departmentFactory, setDepartmentFactory] = useState({
    department: "",
    factory: "",
  });

  const handleDeparmentChanges = (e) => {
    const { name, value } = e.target;

    setDepartmentFactory({
      ...departmentFactory,
      [name]: value,
    });
  };

  const handleContactPerson = (e) => {
    const { name, value } = e.target;
    // alert(name);
    const newErrorsCPerson = { ...errorsCPerson };
    // alert(name);
    switch (name) {
      case "cName":
        if (!value) {
          newErrorsCPerson.cName = "Name required";
        } else if (value.length < 3) {
          newErrorsCPerson.cName = "Name should contain at least 3 letters";
        } else if (/[^a-zA-Z /s]/.test(value)) {
          newErrorsCPerson.cName =
            "Name cannot contain any numeric or special characters";
        } else {
          delete newErrorsCPerson.cName;
        }
        break;

      case "cNIC":
        if (!value) {
          newErrorsCPerson.cNIC = "NIC number required";
        } else {
          if (!/^[0-9]{9}[vV]{1}$/.test(value) && !/^[0-9]{12}$/.test(value)) {
            newErrorsCPerson.cNIC = "Invalid NIC number";
          } else {
            delete newErrorsCPerson.cNIC;
            // alert(value);
          }
        }
        break;

      case "cMobileNo":
        if (!value) {
          newErrorsCPerson.cMobileNo = "Mobile number required";
        } else if (!/^[0-9]{10}$/.test(value)) {
          newErrorsCPerson.cMobileNo = "Invalid mobile number";
        } else {
          delete newErrorsCPerson.cMobileNo;
        }
        break;

      case "cEmail":
        if (value !== "") {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            newErrorsCPerson.cEmail = "Invalid email";
          } else {
            delete newErrorsCPerson.cEmail;
          }
        } else {
          delete newErrorsCPerson.cEmail;
        }
        break;

      default:
        break;
    }

    setErrorsCPerson(newErrorsCPerson);
    // alert(value);
    if (Object.keys(newErrorsCPerson).length === 0) {
      setContactPerson({
        ...contactPerson,
        [name]: value,
      });
    }
  };

  //state for store date and time details

  const [dateTimeErrors, setDateTimeErrors] = useState({});
  const dateTimeError = {};
  const today = new Date().toLocaleDateString("en-CA");
  const [showLoader, setShowLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleDate = (e) => {
    const { name, value } = e.target;
    // if (value < today) {
    //   alert("Incorrect date");
    // }
    // alert(name)

    switch (name) {
      case "dateFrom":
        if (!value) {
          dateTimeError.dateFrom = "Please select a date";
        } else if (value < today) {
          dateTimeError.dateFrom = "Date cannot be in the past";
        }
        setDateTimeErrors(dateTimeError);
        break;

      case "dateTo":
        const dateTo = dateTime.dateFrom || today;
        // alert(dateTo);
        // alert("date to");
        if (value !== "") {
          if (value < today) {
            dateTimeError.dateTo = "Date cannot be in the past";
            // alert("Date cannot be past");
          } else {
            delete dateTimeError.dateTo;
          }

          if (value < dateTo) {
            dateTimeError.dateTo = "Date to cannot be in past than date from";
          } else {
            delete dateTimeError.dateFrom;
          }
        } else {
          delete dateTimeError.dateTo;
        }
        setDateTimeErrors(dateTimeError);
      default:
        break;
    }

    // alert(name);
    setDateTime({
      ...dateTime,
      [name]: value,
    });
  };

  // const [vehicles, setVehicles] = useState(location.state?.visitor.Vehicles);
  const [vehicles, setVehicles] = useState(
    location.state?.visitor?.Vehicles || []
  );
  // vehicles
  // console.log("vehicles ==============", vehicles);

  const [vehicleErrors, setVehicleErrors] = useState({});
  const vehicleError = {};

  //to handlevehicle changes of vehicle use state
  const handleVehicleChanges = (index, e) => {
    const { name, value } = e.target;

    // Update vehicle errors if needed
    if (name === "Vehicle_Type") {
      if (!value) {
        vehicleErrors.Vehicle_Type = "Vehicle type required"; // Update error message
        setVehicleErrors({ ...vehicleErrors });
      } else if (!/^[A-Za-z]{3,30}/.test(value)) {
        vehicleErrors.Vehicle_Type = "Invalid vehicle type"; // Update error message
        setVehicleErrors({ ...vehicleErrors });
      } else {
        delete vehicleErrors.Vehicle_Type; // Remove error if valid
        setVehicleErrors({ ...vehicleErrors });
      }
    }

    const updatedVehicles = [...vehicles];
    updatedVehicles[index][name] = value;

    console.log(updatedVehicles); // Ensure the updatedVehicles array looks as expected
    setVehicles(updatedVehicles); // Update the vehicles state
  };

  //to add new vehicle rows
  const handleVehiclePlus = () => {
    const { Vehicle_No, Vehicle_Type } = vehicles[vehicles.length - 1];
    // alert(Vehicle_No);

    // Create a new error object so we don't mutate the state directly
    const newVehicleError = { ...vehicleError };

    if (!Vehicle_No) {
      alert("vehicle number not found");
      newVehicleError.VehicleNo = "Vehicle no required*";
    } else {
      delete newVehicleError.VehicleNo;
    }

    if (!Vehicle_Type) {
      alert("vehicle type not found");
      newVehicleError.VehicleType = "Vehicle type required*";
    } else {
      delete newVehicleError.VehicleType;
    }

    // Update the vehicleErrors state correctly
    setVehicleErrors(newVehicleError);
    // alert(newVehicleError.length);

    // Only add a new vehicle if there are no errors
    if (
      Object.keys(newVehicleError).length === 0 ||
      newVehicleError === undefined
    ) {
      // alert("adding 0");
      // Create a new vehicle object and add it to the list
      const newVehicle = { VehicleNo: "", VehicleType: "" };
      setVehicles((prevVehicles) => [...prevVehicles, newVehicle]);
    }
  };

  const removeVisitor = (e, index) => {
    // alert(index);
    e.preventDefault();
    if (index <= 0) {
      return;
    }
    const updatedVisitors = visitors.filter((_, i) => i !== index);
    setVisitors(updatedVisitors);
  };

  const removeVehicle = (e, index) => {
    e.preventDefault();
    // if (index <= 0) {
    //   return;
    // }
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

  //handle visitor changes

  const [visitors, setVisitors] = useState(
    location.state?.visitor.Visitors || []
  );

  console.log("visitors ===============", visitors);
  //to soter visitors errors
  const [visitorErrors, setVisitorErrors] = useState({});
  const visitorError = {};
  //to set visitors errors
  const handleVisitorChanges = (index, e) => {
    const { name, value } = e.target;

    // Make a copy of the visitors array to avoid mutation
    const updatedVisitors = [...visitors];

    // Update the specific visitor field
    updatedVisitors[index] = {
      ...updatedVisitors[index],
      [name]: value, // Dynamically update the field based on the `name` attribute
    };

    // Update the visitors state
    setVisitors(updatedVisitors);
  };

  const handleVisitorsPlus = () => {
    // Ensure you're using the correct field names from the `visitors` state
    const { Visitor_Name, Visitor_NIC } = visitors[visitors.length - 1];

    const newVisitorError = { ...visitorError };

    // Validate Visitor Name
    if (!Visitor_Name) {
      newVisitorError.visitorName = "Visitor name required*";
    } else if (!/^[A-Za-z\s]{3,255}$/.test(Visitor_Name)) {
      newVisitorError.visitorName =
        "Name should contain at least 3 letters and shouldn't contain any numbers or special characters";
    } else {
      delete newVisitorError.visitorName;
    }

    // Validate Visitor NIC
    if (!Visitor_NIC) {
      newVisitorError.visitorNIC = "Visitor NIC required*";
    } else {
      delete newVisitorError.visitorNIC;
    }

    // Update the `visitorError` state
    setVisitorErrors(newVisitorError);

    // If there are no validation errors, add a new visitor to the list
    if (Object.keys(newVisitorError).length === 0) {
      const newVisitor = { Visitor_Name: "", Visitor_NIC: "" }; // New visitor object with empty fields
      setVisitors((prevVisitors) => [...prevVisitors, newVisitor]);
    }
  };

  //to store form data
  const [formData, setformData] = useState({
    departmentDetails: {},
    contactPersonDetails: {},
    visitorDetails: {},
    vehicleDetails: {},
    dateTimeDetails: {},
  });
  //to store errors in submit event
  const [subErros, setSubErrors] = useState({});
  const subErrors = {};

  //handle submit event
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate contact person fields (or any other fields)
    const { cName, cMobileNo, cEmail } = contactPerson;
    const subErrors = {};

    if (!cName) {
      subErrors.cName = "Name required*";
    } else if (cName.length < 3) {
      subErrors.cName = "Name should have at least 3 letters*";
    } else {
      delete subErrors.cName;
    }

    if (!cMobileNo) {
      subErrors.cMobileNo = "Mobile number required*";
    } else if (!/^[0-9]{10}/) {
      subErrors.cMobileNo = "Invalid mobile number*";
    } else {
      delete subErrors.cMobileNo;
    }

    if (cEmail !== "") {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cEmail)) {
        subErrors.cEmail = "Invalid email";
      } else {
        delete subErrors.cEmail;
      }
    } else {
      delete subErrors.cEmail;
    }

    // If no errors, continue with form submission
    // if (Object.keys(subErrors).length === 0) {
    // Directly create the formData object with the latest state values
    const newFormData = {
      // visitId:
      departmentDetails: departmentFactory,
      contactPersonDetails: contactPerson,
      visitorDetails: visitors,
      vehicleDetails: vehicles,
      dateTimeDetails: dateTime,
    };

    // console.log(newFormData);

    try {
      setIsLoading(true);
      // alert(csrfToken);
      // console.log("loging: ", newFormData);
      const response = await axios.post(
        "http://localhost:3000/visitor/registration",
        newFormData, // Request body
        {
          headers: { "X-CSRF-Token": csrfToken }, // Headers
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        setSubErrors(false);
        setErrorMessages("");
        setSuccessMessage({ operation: "success", mail: response.data.email });
        // alert("Visit creation success");
        navigate("/visitor-success", { replace: true });
        if (response.data.success && response.data.success === true) {
          // alert("Mail sent success");
        } else {
          // alert("Mail sent failed");
        }
      }
    } catch (error) {
      setIsLoading(false);
      setSubErrors(false);
      // alert("Error");
      console.log(error);
      if (error.isAxiosError) {
        let errorMessage = "An error occurred.";

        if (error.response) {
          // Server responded with an error status code
          switch (error.response.status) {
            case 400:
              // alert(response.errors);
              // Access validation errors sent from backend
              const validationErrors = error.response.data.errors;
              console.log("Validation errors:", validationErrors);
              setErrorMessages(
                validationErrors.map((err) => err.msg).join(", ")
                // this.return
              );
              errorMessage =
                error.response.data.error ||
                "Bad request. Please check your input. error code 400";
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
              setErrorMessages("An unexprected error occurred.");
              errorMessage =
                error.response.data.message || "An unexpected error occurred.";
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
        // alert("An unexpected error occurred.");
        console.error("Error:", error);
      }
    }
  };

  const updateVisit = async (e) => {
    e.preventDefault();
    alert("updating");
    const formData = {
      contactPerson: contactPerson,
      visitingDateTime: dateTime,
      vehicleDetails: vehicles,
      visitorDetails: visitors,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3000/visitor/updatevisit-reception",
        formData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      // Success case
      if (response.status === 200) {
        setIsLoading(false);
        swal.fire({
          title: "Visit update success...!",
          text: response.data.message || "Visit updated successfully",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "Ok",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      setIsLoading(false);

      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;

        if (status === 400) {
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            // Format validation errors for display
            const errorMessages = data.errors
              .map((err) => err.msg || err.message)
              .join("<br>");
            swal.fire({
              title: "Validation Error",
              html: errorMessages,
              icon: "error",
              confirmButtonText: "Ok",
            });
          } else {
            // Generic 400 error
            swal.fire({
              title: "Error",
              text: data.message || "Invalid request data",
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        } else if (status === 401 || status === 403) {
          // Authentication/authorization errors
          swal.fire({
            title: "Access Denied",
            text:
              data.message ||
              "You don't have permission to perform this action",
            icon: "warning",
            confirmButtonText: "Ok",
          });
        } else if (status === 404) {
          // Not found errors
          swal.fire({
            title: "Not Found",
            text: data.message || "The requested resource was not found",
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else if (status === 500) {
          // Server errors
          swal.fire({
            title: "Server Error",
            text:
              data.message ||
              "Something went wrong on our side. Please try again later.",
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          // Other HTTP errors
          swal.fire({
            title: "Error",
            text: data.message || "An unexpected error occurred",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      } else if (error.request) {
        // The request was made but no response was received
        swal.fire({
          title: "Network Error",
          text: "The server did not respond. Please check your connection and try again.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        swal.fire({
          title: "Error",
          text:
            error.message || "An error occurred while setting up the request",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
      // Log the full error for debugging
      console.error("Error details:", error);
    }

    console.log("form data:......... ", formData);
  };

  return (
    <div className="visitor-container">
      {isLoading && (
        <div className="text-center w-full h-full">
          <div className="loader-overlay w-full h-full">
            <div className="loader"></div>
            {/* <h1 className="text-center">Loading</h1> */}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h1 className="vTitle">Visitor Registration Form</h1>

        <div className="vFactoryDepartment">
          <div>
            <label htmlFor="">
              Visiting Factory <span className="text-red-600">*</span>:{" "}
            </label>
            <select
              name="factory"
              style={{ cursor: "pointer" }}
              className="vInput"
              onChange={(e) => {
                handleDeparmentChanges(e);
                fetchDepartments(e);
              }}
            >
              <option value="">Select Factory</option>
              {Array.isArray(factories) &&
                factories.map((factory) => {
                  return (
                    <option value={factory.Factory_Id}>
                      {factory.Factory_Name}
                    </option>
                  );
                })}
              {/* <option value="Concord Apparel">Concord Apparel</option>
              <option value="Concord Footwear">Concord Footwear</option>
              <option value="Guston Lanka">Guston Lanka</option> */}
            </select>
          </div>

          <div>
            <label htmlFor="">
              Visiting Department <span className="text-red-600">*</span>:{" "}
            </label>
            <select
              style={{ cursor: "pointer" }}
              name="department"
              className="vInput"
              onChange={handleDeparmentChanges}
            >
              <option value="Selected Department">Select Department</option>
              {Array.isArray(departments) &&
                departments.map((department) => {
                  return (
                    <option value={department.Department_Id}>
                      {department.Department_Name}
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        <div className="contactDateTimeDiv flex">
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Contact Persons Details</div>
            <div className="bottom">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="">
                        Contact Person <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cName"
                        onChange={handleContactPerson}
                        placeholder="Enter Name"
                        defaultValue={ContactPerson_Name}
                      />
                      {errorsCPerson.cName && (
                        <p className="error">{errorsCPerson.cName}</p>
                      )}
                      {subErros.cName && (
                        <p className="error">{subErros.cName}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="">
                        NIC Number <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cNIC"
                        onChange={handleContactPerson}
                        placeholder="Enter NIC number"
                        defaultValue={ContactPerson_NIC}
                      />
                      {errorsCPerson.cNIC && (
                        <p className="error">{errorsCPerson.cNIC}</p>
                      )}

                      {subErros.cMobileNo && (
                        <p className="error">{subErros.cMobileNo}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="">
                        Mobile No <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cMobileNo"
                        onChange={handleContactPerson}
                        placeholder="Enter mobile number"
                        defaultValue={ContactPerson_ContactNo}
                      />
                      {errorsCPerson.cMobileNo && (
                        <p className="error">{errorsCPerson.cMobileNo}</p>
                      )}

                      {subErros.cMobileNo && (
                        <p className="error">{subErros.cMobileNo}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="">Email</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cEmail"
                        onChange={handleContactPerson}
                        placeholder="Enter email"
                        defaultValue={ContactPerson_Email}
                      />
                      {errorsCPerson.cEmail && (
                        <p className="error">{errorsCPerson.cEmail}</p>
                      )}
                      {subErros.cEmail && (
                        <p className="error">{subErros.cEmail}</p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="contactDiv vsub-div">
            <div className="top subTpk">Visiting Date & Time</div>
            <div className="bottom">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label htmlFor="">
                        From <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <span>
                        <input
                          type="date"
                          name="dateFrom"
                          onChange={handleDate}
                          className="vInput w-full mb-1"
                          defaultValue={dateFrom}
                        />
                        <p className="error">
                          {dateTimeErrors.dateFrom && dateTimeErrors.dateFrom}
                        </p>
                        {errorsCPerson.dateFrom && (
                          <p className="error">{errorsCPerson.dateFrom}</p>
                        )}
                      </span>
                      <div className="text-left flex">
                        <span>
                          <input
                            type="time"
                            name="fTimeFrom"
                            onChange={handleDate}
                            defaultValue={Time_From}
                          />
                        </span>
                        <span className="ml-6 mr-6">To</span>

                        <span>
                          <input
                            type="time"
                            name="fTimeTo"
                            onChange={handleDate}
                            defaultValue={Time_To}
                          />
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="">To</label>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="vInput w-full mb-1"
                        name="dateTo"
                        onChange={handleDate}
                        defaultValue={`${dateTo}`}
                      />
                      <p className="error">
                        {dateTimeErrors.dateTo && dateTimeErrors.dateTo}
                      </p>
                      <div className="text-left">
                        {/* <td className="flex">
                          <span>
                            <input
                              type="time"
                              name="tTimeFrom"
                              onChange={handleDate}
                            />
                          </span>

                          <span className="ml-6 mr-6">To</span>

                          <span>
                            <input
                              type="time"
                              name="tTimeTo"
                              onChange={handleDate}
                            />
                          </span>
                        </td> */}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="contactDateTimeDiv flex">
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Vehicle Details</div>
            <div className="bottom">
              <table className="tblVehicles">
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Vehicle No</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle, index) => (
                    <tr key={index} className="trVehicle">
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          placeholder="Vehicle Type"
                          name="Vehicle_Type"
                          value={vehicle.Vehicle_Type} // Make sure name and value are correct
                          onChange={(e) => handleVehicleChanges(index, e)}
                        />
                        {index === vehicles.length - 1 &&
                          vehicleErrors.Vehicle_Type && (
                            <p className="error">
                              {vehicleErrors.Vehicle_Type}
                            </p>
                          )}
                      </td>
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          placeholder="Vehicle Number"
                          name="Vehicle_No"
                          value={vehicle.Vehicle_No} // Ensure value matches the state property
                          onChange={(e) => handleVehicleChanges(index, e)}
                        />
                        {index === vehicles.length - 1 &&
                          vehicleErrors.Vehicle_No && (
                            <p className="error">{vehicleErrors.Vehicle_No}</p>
                          )}
                      </td>
                      <td style={{ border: "0" }}>
                        <FaPlusCircle
                          className="vf-icon hover:text-green-600"
                          onClick={handleVehiclePlus} // Your existing logic for adding a vehicle
                        />
                        <MdDelete
                          onClick={(e) => removeVehicle(e, index)} // Pass index correctly
                          className="vf-icon hover:text-red-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="contactDiv vsub-div">
            <div className="top subTpk">Visitor Details</div>
            <div className="bottom">
              <table className="tblVehicles w-full">
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>NIC</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor, index) => (
                    <tr key={visitor.visitorId}>
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          name="Visitor_Name"
                          value={visitor.Visitor_Name} // Controlled input
                          onChange={(e) => handleVisitorChanges(index, e)} // Handle change for the visitor
                          placeholder="Visitor Name"
                        />
                        {index === visitors.length - 1 &&
                          visitorErrors.visitorName && (
                            <p className="error">{visitorErrors.visitorName}</p>
                          )}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="vTblInput"
                          name="Visitor_NIC"
                          value={visitor.Visitor_NIC} // Controlled input
                          onChange={(e) => handleVisitorChanges(index, e)} // Handle change for the NIC
                          placeholder="Visitor NIC"
                        />
                        {index === visitors.length - 1 &&
                          visitorErrors.visitorNIC && (
                            <p className="error">{visitorErrors.visitorNIC}</p>
                          )}
                      </td>
                      <td style={{ border: "0", width: "1%" }}>
                        <FaPlusCircle
                          className="vf-icon hover:text-green-600"
                          onClick={handleVisitorsPlus} // Add new visitor on plus button click
                        />
                        <MdDelete
                          onClick={(e) => removeVisitor(e, index)} // Pass visitorId instead of index
                          className="vf-icon hover:text-red-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center guidLine">
          <input
            type="checkbox"
            name=""
            id="guidelines"
            onChange={() => setDisableSubmitButton(!disableSubmitButton)}
          />{" "}
          <span>
            <label htmlFor="guidelines">
              I do hereby agree to all the guidelines provided by the company
            </label>
          </span>
        </div>

        {/* <div className="success text-center">
          <p>
            .
            {successMessage.operation === "success" &&
              "New visit creation success"}
          </p>
          <p>.{successMessage.mail === true && "Email sent success"}</p>
        </div> */}

        <div className="" id="errorMessage">
          {/* {alert(errorMessage)} */}
          {/* setting the error message to user */}
          {errorMessages && (
            <p className="errorCenter mt-1">*{errorMessages}</p>
          )}
        </div>

        <div className="">
          <p className="error text-center" style={{ textAlign: "center" }}>
            {disableSubmitButton === true &&
              "You must accept our terms & conditions by checking this checkbox"}
          </p>
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={disableSubmitButton}
            className="mr-5 mt-4 vBtn"
            onClick={updateVisit}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVisitor;
