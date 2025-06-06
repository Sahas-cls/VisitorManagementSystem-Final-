import React, { useState, useEffect } from "react";
import { FaKiss, FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./VisitorF.css";
import axios from "axios";
import { MdDelete } from "react-icons/md";

const VisitorF = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [contactPerson, setContactPerson] = useState({
    cName: "",
    cNIC: "",
    cMobileNo: "",
    cEmail: "",
  });
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
  const [serverSideErrors, setserverSideErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  // !to get all factory details
  const getFactories = async () => {
    // alert("getting factories");
    try {
      // alert(csrfToken);
      // alert("sending factory request");
      const response = await axios.get(
        `${apiUrl}/department/getAll-Factories`,
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
        `${apiUrl}/department/getDep/${factoryId}`
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
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
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
          `${apiUrl}/visitor/getDepartments`,
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
  const [dateTime, setDateTime] = useState({});
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

  const [vehicles, setVehicles] = useState([
    { VehicleNo: "", VehicleType: "" },
  ]);

  const [vehicleErrors, setVehicleErrors] = useState({});
  const vehicleError = {};

  //to handlevehicle changes of vehicle use state
  const handleVehicleChanges = (index, e) => {
    const { name, value } = e.target;

    // Validate VehicleType input
    if (name === "VehicleType") {
      if (!value) {
        vehicleErrors.VehicleType = "Vehicle type required"; // Update error message
        setVehicleErrors({ ...vehicleErrors }); // Trigger re-render by updating the state
        // return; // Exit early if validation fails
      } else {
        if (!/^[A-Za-z]{3,30}/.test(value)) {
          vehicleErrors.VehicleType = "Invalid vehicle type"; // Update error message
          setVehicleErrors({ ...vehicleErrors }); // Trigger re-render by updating the state
          // return; // Exit early if validation fails
        } else {
          delete vehicleErrors.VehicleType; // Remove error message if valid
          setVehicleErrors({ ...vehicleErrors }); // Trigger re-render by updating the state
        }
      }
    }

    const updatedVehicles = [...vehicles];
    updatedVehicles[index][name] = value;
    setVehicles(updatedVehicles); // Update the vehicles state
  };

  console.log("vehicels ", vehicles);

  //to add new vehicle rows
  const handleVehiclePlus = () => {
    const { VehicleNo, VehicleType } = vehicles[vehicles.length - 1];
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

    if (Object.keys(vehicleError).length === 0) {
      const newVehicle = [...vehicles, { VehicleNo: "", VehicleType: "" }];
      setVehicles(newVehicle);
    }
    // alert("adding vehicle");
  };

  const removeVisitor = (e, index) => {
    // alert(index);
    e.preventDefault();
    const updatedVisitors = visitors.filter((_, i) => i !== index);

    if (updatedVisitors.length === 0) {
      return;
    }
    setVisitors(updatedVisitors);
  };

  // const removeVehicle = (e, index) => {
  //   e.preventDefault();
  //   // if (index <= 0) {
  //   //   return;
  //   // }
  //   // console.log("Removing vehicle at index:", index); // Debugging line

  //   // Create a new array of vehicles excluding the vehicle at the given index
  //   const updatedVehicles = vehicles.filter((_, i) => i !== index);

  //   // console.log("Updated vehicles:", updatedVehicles); // Debugging line
  //   // console.log(updatedVehicles);
  //   // Update the state with the new list of vehicles
  //   setVehicles(updatedVehicles);

  //   // Optional: Remove the vehicle's error from the errors state (if needed)

  //   const updatedErrors = { ...vehicleErrors };
  //   // alert(updatedVehicles.length);
  //   alert(updatedVehicles.length)
  //   if (updatedVehicles.length === 0) {
  //     alert("from inside of if condition")
  //     return;
  //   }

  //   delete updatedErrors[index];
  //   setVehicleErrors(updatedErrors);
  // };

  const removeVehicle = (e, index) => {
    e.preventDefault();

    // Filter out the selected vehicle
    const updatedVehicles = vehicles.filter((_, i) => i !== index);

    // alert(updatedVehicles.length); // For debugging
    if (updatedVehicles.length === 0) {
      // alert("from inside of if condition");
      return;
    }

    setVehicles(updatedVehicles);

    // Optionally remove associated error
    const updatedErrors = { ...vehicleErrors };
    delete updatedErrors[index];
    setVehicleErrors(updatedErrors);
  };

  //handle visitor changes
  const [visitors, setVisitors] = useState([
    {
      visitorName: "",
      visitorNIC: "",
    },
  ]);
  //to soter visitors errors
  const [visitorErrors, setVisitorErrors] = useState({});
  const visitorError = {};
  //to set visitors errors
  const handleVisitorChanges = (index, e) => {
    const { name, value } = e.target;
    // alert(value);
    const updateVisitor = [...visitors];
    updateVisitor[index][name] = value;
    setVisitors(updateVisitor);
  };

  const handleVisitorsPlus = () => {
    // alert("clicked")
    const { visitorName, visitorNIC } = visitors[visitors.length - 1];
    // alert(visitorName);
    if (!visitorName) {
      visitorError.visitorName = "Visitor name required*";
    } else {
      if (!/^[A-Za-z\s]{3,255}$/.test(visitorName)) {
        visitorError.visitorName =
          "Name should contain at least 3 letters and shouldn't contain any numbers or special characters";
      } else {
        delete visitorError.visitorName;
      }
      // delete visitorError.visitorName;
    }

    if (!visitorNIC) {
      visitorError.visitorNIC = "Visitor NIC required*";
    } else if (!/^[0-9]{9}[vV]{1}$|^[0-9]{12}$/.test(visitorNIC)) {
      visitorError.visitorNIC = "Invalid NIC format";
    } else {
      delete visitorError.visitorNIC;
    }

    setVisitorErrors(visitorError);

    if (Object.keys(visitorError).length === 0) {
      const newVisitor = [...visitors, { visitorName: "", visitorNIC: "" }];
      setVisitors(newVisitor);
    }
    // alert(visitorNIC);
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
        `${apiUrl}/visitor/registration`,
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
              setserverSideErrors(validationErrors);
              console.log("server side errors", validationErrors);
              // console.log("Validation errors:", validationErrors);
              setErrorMessages(
                validationErrors.map((err) => err.msg).join("\n, * ")
                // this.return
              );
              errorMessage =
                error.response.data.error ||
                "Bad request. Please check your input. error code 400";
              break;
            // console.log(error.errors);
            // setErrorMessages("Bad request. Please check your input.");
            // errorMessage =
            //   error.response.data.error ||
            //   "Bad request. Please check your input. error code 400";
            // break;
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
    // } else {
    // setErrorMessages(
    // "Please fill all the required(*) details before submit data"
    // );
    // alert("Please fill all the required fields");
    // }
  };

  return (
    <div className="visitor-container md:px-6 ">
      {/* bg-[radial-gradient(circle_at_bottom_left,_rgba(107,183,255,0.247),_white)] */}
      {/* <div class="absolute top-0 -z-10 h-full w-full bg-white"><div class="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]"></div></div> */}
      {isLoading && (
        <div className="text-center w-full h-full">
          <div className="loader-overlay w-full h-full">
            <div className="loader"></div>
            {/* <h1 className="text-center">Loading</h1> */}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <h1 className="text-center mt-8 text-2xl text-blue-900 underline font-extrabold uppercase">
          Visitor Registration
        </h1>

        <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 mt-14">
          <div className="flex justify-center">
            <div className="">
              <label htmlFor="">
                Factory <span className="text-red-600">*</span>:{" "}
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
              {Array.isArray(serverSideErrors) &&
                serverSideErrors
                  .filter((err) => err.path === "departmentDetails.factory")
                  .map((err, index) => (
                    <p className="error" key={index}>
                      {err.msg}
                    </p>
                  ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="">
              <label htmlFor="">
                Department <span className="text-red-600">*</span>:{" "}
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
              {Array.isArray(serverSideErrors) &&
                serverSideErrors
                  .filter((err) => err.path === "departmentDetails.department")
                  .map((err, index) => (
                    <p className="error" key={index}>
                      {err.msg}
                    </p>
                  ))}
            </div>
          </div>
        </div>

        <div className="contactDateTimeDiv flex gap-6 md:mt-6">
          <div className="w-11/12 rounded-md shadow-lg px-2 py-4 border-2 border-black/20 vsub-div">
            <div className="text-lg mb-4 text-blue-900 tracking-wider backdrop:blur-2xl">
              Contact Persons Details
            </div>
            <div className="bottom ">
              <table>
                <tbody>
                  <tr className="">
                    <td>
                      <label htmlFor="">
                        Contact Person <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="px-2 py-1 border border-black/40 rounded-md w-full mt-2"
                        name="cName"
                        onChange={handleContactPerson}
                        placeholder="Enter Name"
                      />
                      {errorsCPerson.cName && (
                        <p className="error">{errorsCPerson.cName}</p>
                      )}
                      {subErros.cName && (
                        <p className="error">{subErros.cName}</p>
                      )}

                      {Array.isArray(serverSideErrors) &&
                        serverSideErrors
                          .filter(
                            (err) => err.path === "contactPersonDetails.cName"
                          )
                          .map((err, index) => (
                            <p className="error" key={index}>
                              {err.msg}
                            </p>
                          ))}
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
                        className="px-2 py-1 border border-black/40 rounded-md w-full mt-2"
                        name="cNIC"
                        onChange={handleContactPerson}
                        placeholder="Enter NIC number"
                      />

                      {Array.isArray(serverSideErrors) &&
                        serverSideErrors
                          .filter(
                            (err) => err.path === "contactPersonDetails.cNIC"
                          )
                          .map((err, index) => (
                            <p className="error" key={index}>
                              {err.msg}
                            </p>
                          ))}

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
                        className=" px-2 py-1 border border-black/40 rounded-md w-full mt-2"
                        name="cMobileNo"
                        onChange={handleContactPerson}
                        placeholder="Enter mobile number"
                      />

                      {Array.isArray(serverSideErrors) &&
                        serverSideErrors
                          .filter(
                            (err) =>
                              err.path === "contactPersonDetails.cMobileNo"
                          )
                          .map((err, index) => (
                            <p className="error" key={index}>
                              {err.msg}
                            </p>
                          ))}

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
                        className=" px-2 py-1 border border-black/40 rounded-md w-full mt-2"
                        name="cEmail"
                        onChange={handleContactPerson}
                        placeholder="Enter email"
                      />

                      {Array.isArray(serverSideErrors) &&
                        serverSideErrors
                          .filter(
                            (err) => err.path === "contactPersonDetails.cEmail"
                          )
                          .map((err, index) => (
                            <p className="error" key={index}>
                              {err.msg}
                            </p>
                          ))}

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

          <div className="w-11/12 rounded-md shadow-lg px-2 py-4 border-2 border-black/20 vsub-div mt-2 md:mt-0">
            <div className="text-lg mb-4 text-blue-900 tracking-wider backdrop:blur-2xl">
              Visiting Date & Time
            </div>
            <div className="grid grid-cols-1 grid-rows-3 px-4">
              <div className="flex justify-between">
                <label className="">
                  Date From<span className="text-red-600">*</span>{" "}
                </label>
                <div className="">
                  <input
                    type="date"
                    name="dateFrom"
                    onChange={handleDate}
                    className="mb-1 px-2 py-1 rounded-md border w-52 border-black/50"
                  />
                  {/* displaying errors */}
                  {Array.isArray(serverSideErrors) &&
                    serverSideErrors
                      .filter((err) => err.path === "dateTimeDetails.dateFrom")
                      .map((err, index) => (
                        <p className="error" key={index}>
                          {err.msg}
                        </p>
                      ))}
                </div>
              </div>

              <div className="flex justify-between">
                <label className="">
                  Time <span className="text-red-600">*</span>
                </label>
                <div className="flex gap-4 items-center">
                  <div className="">
                    <input
                      type="time"
                      name="fTimeFrom"
                      className="px-2 py-1 rounded-md w-20"
                      onChange={handleDate}
                    />
                    {Array.isArray(serverSideErrors) &&
                      serverSideErrors
                        .filter(
                          (err) => err.path === "dateTimeDetails.fTimeFrom"
                        )
                        .map((err, index) => (
                          <p className="error text-left" key={index}>
                            {err.msg}
                          </p>
                        ))}
                  </div>
                  <span>To</span>
                  <div className="">
                    <input
                      type="time"
                      name="fTimeTo"
                      className="px-2 py-1 rounded-md w-20"
                      onChange={handleDate}
                    />

                    {Array.isArray(serverSideErrors) &&
                      serverSideErrors
                        .filter((err) => err.path === "dateTimeDetails.fTimeTo")
                        .map((err, index) => (
                          <p className="error text-left" key={index}>
                            {err.msg}
                          </p>
                        ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-2">
                <label className="">
                  Date To <span className="text-red-600">*</span>
                </label>
                <div className="">
                  <input
                    type="date"
                    name="dateTo"
                    onChange={handleDate}
                    className="mb-1 px-2 py-1 rounded-md border w-52 border-black/50"
                  />
                  {Array.isArray(serverSideErrors) &&
                    serverSideErrors
                      .filter((err) => err.path === "dateTimeDetails.dateTo")
                      .map((err, index) => (
                        <p className="error" key={index}>
                          {err.msg}
                        </p>
                      ))}
                </div>
              </div>
            </div>
            <div className="bottom"></div>
          </div>
        </div>

        <div className="contactDateTimeDiv flex md:gap-6 md:mt-6">
          <div className="w-11/12 rounded-md shadow-lg px-2 py-4 border-2 border-black/20 vsub-div mt-4 md:mt-0">
            <div className="text-lg mb-4 text-blue-900 tracking-wider">
              Vehicle Details
            </div>
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
                          name="VehicleType"
                          value={vehicle.VehicleType} // Change defaultValue to value for controlled input
                          onChange={(e) => handleVehicleChanges(index, e)} // Pass index here to handle changes
                        />

                        {index === vehicles.length - 1 &&
                          vehicleErrors.VehicleType && ( // Fix condition to show error for last vehicle
                            <p className="error">{vehicleErrors.VehicleType}</p>
                          )}
                      </td>
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          placeholder="Vehicle Number"
                          name="VehicleNo"
                          value={vehicle.VehicleNo} // Ensure this is controlled too
                          onChange={(e) => handleVehicleChanges(index, e)} // Pass index here to handle changes
                        />
                        {index === vehicles.length - 1 &&
                          vehicleErrors.VehicleNo && ( // Fix condition to show error for last vehicle
                            <p className="error">{vehicleErrors.VehicleNo}</p>
                          )}
                      </td>

                      <td style={{ border: "0" }} className="">
                        <FaPlusCircle
                          className="vf-icon hover:text-green-600"
                          onClick={handleVehiclePlus} // Your existing logic for adding a vehicle
                        />
                        <MdDelete
                          onClick={(e) => removeVehicle(e, index)} // Correctly pass index for removal
                          className="vf-icon hover:text-red-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-11/12 rounded-md shadow-lg px-2 py-4 border-2 border-black/20 vsub-div mt-4 md:mt-0">
            <div className="text-lg mb-4 text-blue-900 tracking-wider">
              Visitor Details
            </div>
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
                    <tr key={visitor.visitorId} className="trVehicle">
                      {" "}
                      {/* Use unique visitorId as the key */}
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          name="visitorName"
                          value={visitor.visitorName} // Controlled input
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
                          name="visitorNIC"
                          value={visitor.visitorNIC} // Controlled input
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
                          onClick={handleVisitorsPlus}
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
              {Array.isArray(serverSideErrors) &&
                serverSideErrors
                  .filter((err) => err.path === "visitorDetails[0].visitorNIC")
                  .map((err, index) => (
                    <p className="error" key={index}>
                      {err.msg}
                    </p>
                  ))}
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

        {/* <div className="" id="errorMessage">
          {errorMessages && (
            <p className="errorCenter mt-1">*{errorMessages}</p>
          )}
        </div> */}

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
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorF;
