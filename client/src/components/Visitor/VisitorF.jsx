import React, { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./VisitorF.css";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClipLoader } from "react-spinners";
import swal from "sweetalert2";
import backgroundImage from "../../assets/VisitorRegistration/Background 1.jpg";
import rule1 from "../../assets/VisitorRegistration/rule1.png";
import rule2 from "../../assets/VisitorRegistration/rule2.jpg";
import rule3 from "../../assets/VisitorRegistration/rule3.png";
import rule4 from "../../assets/VisitorRegistration/rule4.jpg";
import rule5 from "../../assets/VisitorRegistration/rule5.jpg";
import rule6 from "../../assets/VisitorRegistration/rule6.png";
import rule7 from "../../assets/VisitorRegistration/rule7.png";
import rule8 from "../../assets/VisitorRegistration/rule8.png";
// import rule2 from "";
// import rule3 from "";
// import rule4 from "";

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
  let errorMessage = "";
  const [factories, setFactories] = useState({});
  const [departments, setDepartments] = useState({});
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [serverSideErrors, setserverSideErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  const vToday = new Date();
  vToday.setHours(0, 0, 0, 0);

  const getFactories = async () => {
    try {
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
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchDepartments = async (e) => {
    const factoryId = e.target.value;
    try {
      const response = await axios.get(
        `${apiUrl}/department/getDep/${factoryId}`
      );
      if (response) {
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
          const csrf = await response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        console.error(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

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
          setDepartmentList(visitorList.data.data);
        }
      } catch (error) {
        setErrorMessages(error.message);
      }
    };
    getDepartments();

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
    if (Object.keys(newErrorsCPerson).length === 0) {
      setContactPerson({
        ...contactPerson,
        [name]: value,
      });
    }
  };

  const [dateTime, setDateTime] = useState({});
  const [dateTimeErrors, setDateTimeErrors] = useState({});
  const dateTimeError = {};
  const today = new Date().toLocaleDateString("en-CA");
  const [isLoading, setIsLoading] = useState(false);

  const handleDate = (e) => {
    const { name, value } = e.target;

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
        if (value !== "") {
          if (value < today) {
            dateTimeError.dateTo = "Date cannot be in the past";
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

  const handleVehicleChanges = (index, e) => {
    const { name, value } = e.target;

    if (name === "VehicleType") {
      if (!value) {
        vehicleErrors.VehicleType = "Vehicle type required";
        setVehicleErrors({ ...vehicleErrors });
      } else {
        if (!/^[A-Za-z]{3,30}/.test(value)) {
          vehicleErrors.VehicleType = "Invalid vehicle type";
          setVehicleErrors({ ...vehicleErrors });
        } else {
          delete vehicleErrors.VehicleType;
          setVehicleErrors({ ...vehicleErrors });
        }
      }
    }

    const updatedVehicles = [...vehicles];
    updatedVehicles[index][name] = value;
    setVehicles(updatedVehicles);
  };

  const handleVehiclePlus = () => {
    const { VehicleNo, VehicleType } = vehicles[vehicles.length - 1];

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

    setVehicleErrors(vehicleError);

    if (Object.keys(vehicleError).length === 0) {
      const newVehicle = [...vehicles, { VehicleNo: "", VehicleType: "" }];
      setVehicles(newVehicle);
    }
  };

  const removeVisitor = (e, index) => {
    e.preventDefault();
    const updatedVisitors = visitors.filter((_, i) => i !== index);

    if (updatedVisitors.length === 0) {
      return;
    }
    setVisitors(updatedVisitors);
  };

  const removeVehicle = (e, index) => {
    e.preventDefault();

    const updatedVehicles = vehicles.filter((_, i) => i !== index);

    if (updatedVehicles.length === 0) {
      return;
    }

    setVehicles(updatedVehicles);

    const updatedErrors = { ...vehicleErrors };
    delete updatedErrors[index];
    setVehicleErrors(updatedErrors);
  };

  const [visitors, setVisitors] = useState([
    {
      visitorName: "",
      visitorNIC: "",
    },
  ]);

  const [visitorErrors, setVisitorErrors] = useState({});
  const visitorError = {};

  const handleVisitorChanges = (index, e) => {
    const { name, value } = e.target;
    const updateVisitor = [...visitors];
    updateVisitor[index][name] = value;
    setVisitors(updateVisitor);
  };

  const handleVisitorsPlus = () => {
    const { visitorName, visitorNIC } = visitors[visitors.length - 1];

    if (!visitorName) {
      visitorError.visitorName = "Visitor name required*";
    } else {
      if (!/^[A-Za-z\s]{3,255}$/.test(visitorName)) {
        visitorError.visitorName =
          "Name should contain at least 3 letters and shouldn't contain any numbers or special characters";
      } else {
        delete visitorError.visitorName;
      }
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
  };

  const [formData, setformData] = useState({
    departmentDetails: {},
    contactPersonDetails: {},
    visitorDetails: {},
    vehicleDetails: {},
    dateTimeDetails: {},
  });

  const [subErros, setSubErrors] = useState({});

  const handleSubmit = async (e) => {
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

    const newFormData = {
      departmentDetails: departmentFactory,
      contactPersonDetails: contactPerson,
      visitorDetails: visitors,
      vehicleDetails: vehicles,
      dateTimeDetails: dateTime,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${apiUrl}/visitor/registration`,
        newFormData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        setSubErrors(false);
        setErrorMessages("");
        setSuccessMessage({ operation: "success", mail: response.data.email });
        navigate("/visitor-success", { replace: true });
      }
    } catch (error) {
      setIsLoading(false);
      setSubErrors(false);
      console.log(error);
      if (error.isAxiosError) {
        let errorMessage = "An error occurred.";

        if (error.response) {
          switch (error.response.status) {
            case 400:
              const validationErrors = error.response.data.errors;
              setserverSideErrors(validationErrors);
              setErrorMessages(
                validationErrors.map((err) => err.msg).join("\n, * ")
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
          setErrorMessages(
            "Network error. Please check your internet connection."
          );
          errorMessage =
            "Network error. Please check your internet connection.";
        }
      } else {
        setErrorMessages("An unexpected error occurred.");
        console.error("Error:", error);
      }
    }
  };

  const showInstructions = () => {
    if (disableSubmitButton === true) {
      swal.fire({
        title: "visitor instructions",
      });
    }
  };

  const validationSchema = Yup.object({
    factory: Yup.number().required("Select a factory"),
    department: Yup.number().required("Select a department"),
    cName: Yup.string()
      .min(3, "Name should have at least 4 characters")
      .max(254, "Name should have less than 254 characters")
      .required("Name required"),
    cNIC: Yup.string()
      .matches(/^(\d{9}[vV]|\d{12})$/, "Invalid nic format")
      .required("NIC required"),
    cMobileNo: Yup.string()
      .matches(/^0\d{9}$/, "Invalid mobile number")
      .required("Mobile number required"),
    cEmail: Yup.string().email("Invalid email"),
    dateFrom: Yup.date()
      .required("Date required")
      .min(vToday, "Date cannot be in past"),
    dateTo: Yup.date()
      .required("Date required")
      .min(vToday, "Date cannot be in past"),
  });

  const Formik = useFormik({
    initialValues: {
      factory: "",
      department: "",
      cName: "",
      cNIC: "",
      cMobileNo: "",
      cEmail: "",
      dateFrom: "",
      fTimeFrom: "",
      fTimeTo: "",
      dateTo: "",
      VehicleType: "",
      VehicleNo: "",
      visitorName: "",
      visitorNIC: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
  });

  const handleInstruction = () => {
    if (disableSubmitButton) {
      swal.fire({
        title: "VISITOR INSTRUCTIONS",
        icon: "info",
        html: `
    <style>
  .image-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
  }

  /* Container for each image to center its child */
  .image-grid > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px; /* Optional: sets a consistent height per cell */
    background-color: #f9f9f9; /* Optional: for better layout feel */
    padding: 5px;
  }

  .image-grid img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Responsive breakpoints */
  @media (max-width: 1024px) {
    .image-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 768px) {
    .image-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .image-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

    <ul style="font-size: 14px; padding-left: 20px; list-style: none;">
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>1.</strong></div>
    <div style="text-align: justify;">Refrain from entering unauthorized. Do not visit factory alone. Always ask for assistance. Stay with your host.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>2.</strong></div>
    <div style="text-align: justify;">No unauthorized photos and videos.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>3.</strong></div>
    <div style="text-align: justify;">Refrain from smoking.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>4.</strong></div>
    <div style="text-align: justify;">Remove all types of metal items before entering.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>5.</strong></div>
    <div style="text-align: justify;">Use the facility complaint management system for any complaints & your valuable feedbacks are always welcome.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>6.</strong></div>
    <div style="text-align: justify;">Safety First, pay attention to all the safety signs and instructions always.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>7.</strong></div>
    <div style="text-align: justify;">In case of emergency, if the fire alarm sounds, evacuate the building from the nearest emergency exit to the assembly point and help the head counter to verify that you are safe.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>8.</strong></div>
    <div style="text-align: justify;">Do not touch machine parts or  do not try to operate without permission of an authorized person.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>9.</strong></div>
    <div style="text-align: justify;">Report all accidents immediately to the company  First Aid room or to the host.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>10.</strong></div>
    <div style="text-align: justify;">Do not spit in open environment.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>11.</strong></div>
    <div style="text-align: justify;">Make sure your vehicle is free from oil leakage to the environment. If you notice any environmentally adverse incident, please inform the management or the main security office.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>12.</strong></div>
    <div style="text-align: justify;">Dispose waste only into labeled bins.</div>
  </li>
  <li style="margin-top:15px; display:flex; align-items:flex-start;">
    <div style="min-width: 30px;"><strong>13.</strong></div>
    <div style="text-align: justify;">Scan the QR for the facility evacuation map.</div>
  </li>
</ul>

    <div class="image-grid" style="margin-top:20px;">
      <div><img src="${rule1}" alt="picture" /></div>
      <div><img src="${rule2}" alt="picture" /></div>
      <div><img src="${rule3}" alt="picture" /></div>
      <div><img src="${rule4}" alt="picture" /></div>
      <div><img src="${rule5}" alt="picture" /></div>
      <div><img src="${rule6}" alt="picture" /></div>
      <div style="background-color:white;"></div>
      <div style="background:white;"></div>
      <div><img src="${rule7}" alt="picture" /></div>
      <div><img src="${rule8}" alt="picture" /></div>
    </div>
  `,
        confirmButtonText: "I Agree",
        confirmButtonColor: "#E4080A",
        width: 650,
        customClass: {
          popup: "visitor-instructions-popup",
        },
        allowOutsideClick: false,
      });
    }
  };

  return (
    <div
      className="visitor-container min-h-screen bg-gray-100/60 md:py-8 md:px-4 sm:px-0 lg:px-8"
      style={{
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <ClipLoader size={50} color="#3b82f6" />
            <p className="mt-4 text-lg font-medium text-gray-700">
              Processing your request...
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={Formik.handleSubmit}
        className="w-[100%] md:w-[70%] opacity-100 lg:max-w-full mx-auto bg-white rounded-xl shadow-md shadow-black/40 overflow-hidden p-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Visitor Registration
          </h1>
          <p className="text-blue-600 text-lg font-medium">Concord Group</p>
        </div>

        {/* Factory and Department Selection */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Factory <span className="text-red-500">*</span>
            </label>
            <select
              name="factory"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={Formik.values.factory}
              onBlur={Formik.handleBlur}
              onChange={(e) => {
                Formik.handleChange(e);
                handleDeparmentChanges(e);
                fetchDepartments(e);
              }}
            >
              <option value="">Select Factory</option>
              {Array.isArray(factories) &&
                factories.map((factory) => (
                  <option key={factory.Factory_Id} value={factory.Factory_Id}>
                    {factory.Factory_Name}
                  </option>
                ))}
            </select>
            {Formik.touched.factory && Formik.errors.factory && (
              <p className="mt-1 text-sm text-red-600">
                {Formik.errors.factory}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={Formik.values.department}
              onBlur={Formik.handleBlur}
              onChange={(e) => {
                handleDeparmentChanges(e), Formik.handleChange(e);
              }}
            >
              <option value="">Select Department</option>
              {Array.isArray(departments) &&
                departments.map((department) => (
                  <option
                    key={department.Department_Id}
                    value={department.Department_Id}
                  >
                    {department.Department_Name}
                  </option>
                ))}
            </select>
            {Formik.touched.department && Formik.errors.department && (
              <p className="mt-1 text-sm text-red-600">
                {Formik.errors.department}
              </p>
            )}
          </div>
        </div>

        {/* Contact Person Details */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Person Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="cName"
                value={Formik.values.cName}
                onBlur={Formik.handleBlur}
                onChange={(e) => {
                  handleContactPerson(e), Formik.handleChange(e);
                }}
                placeholder="Enter Name"
              />
              {Formik.touched.cName && Formik.errors.cName && (
                <p className="mt-1 text-sm text-red-600">
                  {Formik.errors.cName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="cNIC"
                value={Formik.values.cNIC}
                onBlur={Formik.handleBlur}
                onChange={(e) => {
                  handleContactPerson(e), Formik.handleChange(e);
                }}
                placeholder="Enter NIC number"
              />
              {Formik.touched.cNIC && Formik.errors.cNIC && (
                <p className="mt-1 text-sm text-red-600">
                  {Formik.errors.cNIC}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="cMobileNo"
                value={Formik.values.cMobileNo}
                onBlur={Formik.handleBlur}
                onChange={(e) => {
                  handleContactPerson(e), Formik.handleChange(e);
                }}
                placeholder="Enter mobile number"
              />
              {Formik.touched.cMobileNo && Formik.errors.cMobileNo && (
                <p className="mt-1 text-sm text-red-600">
                  {Formik.errors.cMobileNo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                name="cEmail"
                value={Formik.values.cEmail}
                onBlur={Formik.handleBlur}
                onChange={(e) => {
                  handleContactPerson(e), Formik.handleChange(e);
                }}
                placeholder="Enter email"
              />
              {Formik.touched.cEmail && Formik.errors.cEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {Formik.errors.cEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Visiting Date & Time */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Visiting Date & Time
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date From<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={Formik.values.dateFrom}
                  onBlur={Formik.handleBlur}
                  onChange={(e) => {
                    handleDate(e), Formik.handleChange(e);
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {Formik.touched.dateFrom && Formik.errors.dateFrom && (
                  <p className="mt-1 text-sm text-red-600">
                    {Formik.errors.dateFrom}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={Formik.values.dateTo}
                  onBlur={Formik.handleBlur}
                  onChange={(e) => {
                    handleDate(e), Formik.handleChange(e);
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {Formik.touched.dateTo && Formik.errors.dateTo && (
                  <p className="mt-1 text-sm text-red-600">
                    {Formik.errors.dateTo}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex-1">
                  <input
                    type="time"
                    name="fTimeFrom"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleDate}
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="time"
                    name="fTimeTo"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Vehicle Details
            </h2>
            <button
              type="button"
              onClick={handleVehiclePlus}
              className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Vehicle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle No
                  </th>
                  {/* <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle, index) => (
                  <tr key={index}>
                    <td className="md:px-4 md:py-2 whitespace-nowrap border-black/40 border">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 h-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Vehicle Type"
                        name="VehicleType"
                        value={vehicle.VehicleType}
                        onChange={(e) => handleVehicleChanges(index, e)}
                      />
                      {index === vehicles.length - 1 &&
                        vehicleErrors.VehicleType && (
                          <p className="mt-1 text-xs text-red-600">
                            {vehicleErrors.VehicleType}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap border-black/40 border">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Vehicle Number"
                        name="VehicleNo"
                        value={vehicle.VehicleNo}
                        onChange={(e) => handleVehicleChanges(index, e)}
                      />
                      {index === vehicles.length - 1 &&
                        vehicleErrors.VehicleNo && (
                          <p className="mt-1 text-xs text-red-600">
                            {vehicleErrors.VehicleNo}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 max-w-10 border-0 whitespace-nowrap text-right text-sm font-medium bg-gray-50/80">
                      <div className="flex space-x-2 bg-transparent">
                        {vehicles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => removeVehicle(e, index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitor Details */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Visitor Details
            </h2>
            <button
              type="button"
              onClick={handleVisitorsPlus}
              className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Visitor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Visitor Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    NIC
                  </th>
                  {/* <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitors.map((visitor, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-black/40 whitespace-nowrap">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        name="visitorName"
                        value={visitor.visitorName}
                        onChange={(e) => handleVisitorChanges(index, e)}
                        placeholder="Visitor Name"
                      />
                      {index === visitors.length - 1 &&
                        visitorErrors.visitorName && (
                          <p className="mt-1 text-xs text-red-600">
                            {visitorErrors.visitorName}
                          </p>
                        )}
                    </td>
                    <td className="px-4 border border-black/40 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        name="visitorNIC"
                        value={visitor.visitorNIC}
                        onChange={(e) => handleVisitorChanges(index, e)}
                        placeholder="Visitor NIC"
                      />
                      {index === visitors.length - 1 &&
                        visitorErrors.visitorNIC && (
                          <p className="mt-1 text-xs text-red-600">
                            {visitorErrors.visitorNIC}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 max-w-10 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {visitors.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => removeVisitor(e, index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="guidelines"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onChange={() => {
                setDisableSubmitButton(!disableSubmitButton),
                  handleInstruction();
              }}
            />
            <label
              htmlFor="guidelines"
              className="ml-2 block text-sm text-gray-700"
            >
              I agree to all the guidelines provided by the company
            </label>
          </div>
          {disableSubmitButton && (
            <p className="mt-1 text-sm text-center text-red-600">
              You must accept our terms & conditions to proceed
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={disableSubmitButton}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              disableSubmitButton
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorF;
