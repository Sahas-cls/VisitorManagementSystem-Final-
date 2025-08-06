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

const VisitorF = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const today = new Date().toISOString().split("T")[0];

  // Get CSRF token
  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setCsrfToken(response.data.csrfToken);
        }
      } catch (error) {
        console.error(`Error while fetching csrf token: ${error}`);
      }
    };
    getCsrf();
  }, []);

  // Get factories
  useEffect(() => {
    const getFactories = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/department/getAll-Factories`,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (response.data?.data) {
          setFactories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching factories:", error);
      }
    };
    if (csrfToken) getFactories();
  }, [csrfToken]);

  // Fetch departments when factory changes
  const fetchDepartments = async (factoryId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/department/getDep/${factoryId}`
      );
      if (response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    departmentDetails: Yup.object().shape({
      factory: Yup.string().required("Factory is required"),
      department: Yup.string().required("Department is required"),
    }),
    contactPersonDetails: Yup.object().shape({
      cName: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .max(255, "Name too long")
        .required("Name is required"),
      cNIC: Yup.string()
        .matches(/^(\d{9}[vV]|\d{12})$/, "Invalid NIC format")
        .required("NIC is required"),
      cMobileNo: Yup.string()
        .matches(/^0\d{9}$/, "Invalid mobile number")
        .required("Mobile number is required"),
      cEmail: Yup.string().email("Invalid email").nullable(),
    }),
    visitorDetails: Yup.array()
      .of(
        Yup.object().shape({
          visitorName: Yup.string()
            .min(3, "Name must be at least 3 characters")
            .required("Visitor name is required"),
          visitorNIC: Yup.string()
            .matches(/^(\d{9}[vV]|\d{12})$/, "Invalid NIC format")
            .required("Visitor NIC is required"),
        })
      )
      .min(1, "At least one visitor is required"),
    vehicleDetails: Yup.array().of(
      Yup.object().shape({
        VehicleNo: Yup.string().required("Vehicle number is required"),
        VehicleType: Yup.string().required("Vehicle type is required"),
      })
    ),
    dateTimeDetails: Yup.object().shape({
      dateFrom: Yup.date()
        .required("Start date is required")
        .min(today, "Date cannot be in the past"),
      dateTo: Yup.date()
        .required("End date is required")
        .min(Yup.ref("dateFrom"), "End date cannot be before start date"),
      fTimeFrom: Yup.string().required("Start time is required"),
      fTimeTo: Yup.string().required("End time is required"),
    }),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      departmentDetails: {
        department: "",
        factory: "",
      },
      contactPersonDetails: {
        cName: "",
        cNIC: "",
        cMobileNo: "",
        cEmail: "",
      },
      visitorDetails: [
        {
          visitorName: "",
          visitorNIC: "",
        },
      ],
      vehicleDetails: [
        {
          VehicleNo: "",
          VehicleType: "",
        },
      ],
      dateTimeDetails: {
        dateFrom: "",
        dateTo: "",
        fTimeFrom: "",
        fTimeTo: "",
      },
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${apiUrl}/visitor/registration`,
          values,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          navigate("/visitor-success", {
            state: { email: response.data.email },
            replace: true,
          });
        }
      } catch (error) {
        let errorMessage = "An error occurred during submission";
        if (error.response) {
          if (error.response.data?.errors) {
            errorMessage = error.response.data.errors
              .map((err) => err.msg)
              .join(", ");
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        }
        swal.fire("Error", errorMessage, "error");
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Handle factory change
  const handleFactoryChange = (e) => {
    const factoryId = e.target.value;
    formik.setFieldValue("departmentDetails.factory", factoryId);
    formik.setFieldValue("departmentDetails.department", "");
    if (factoryId) fetchDepartments(factoryId);
  };

  // Show instructions popup
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
            .image-grid > div {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100px;
              background-color: #f9f9f9;
              padding: 5px;
            }
            .image-grid img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              display: block;
            }
            @media (max-width: 1024px) {
              .image-grid { grid-template-columns: repeat(4, 1fr); }
            }
            @media (max-width: 768px) {
              .image-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 480px) {
              .image-grid { grid-template-columns: 1fr; }
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
              <div style="text-align: justify;">Do not touch machine parts or do not try to operate without permission of an authorized person.</div>
            </li>
            <li style="margin-top:15px; display:flex; align-items:flex-start;">
              <div style="min-width: 30px;"><strong>9.</strong></div>
              <div style="text-align: justify;">Report all accidents immediately to the company First Aid room or to the host.</div>
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

  // Add visitor
  const addVisitor = () => {
    formik.setFieldValue("visitorDetails", [
      ...formik.values.visitorDetails,
      { visitorName: "", visitorNIC: "" },
    ]);
  };

  // Remove visitor
  const removeVisitor = (index) => {
    const newVisitors = [...formik.values.visitorDetails];
    newVisitors.splice(index, 1);
    formik.setFieldValue("visitorDetails", newVisitors);
  };

  // Add vehicle
  const addVehicle = () => {
    formik.setFieldValue("vehicleDetails", [
      ...formik.values.vehicleDetails,
      { VehicleNo: "", VehicleType: "" },
    ]);
  };

  // Remove vehicle
  const removeVehicle = (index) => {
    const newVehicles = [...formik.values.vehicleDetails];
    newVehicles.splice(index, 1);
    formik.setFieldValue("vehicleDetails", newVehicles);
  };

  return (
    <div
      className="visitor-container min-h-screen bg-gray-100/60 md:py-8 md:px-4 sm:px-0 lg:px-8"
      // style={{
      //   backgroundImage: `url(${backgroundImage})`,
      //   backgroundPosition: "center",
      //   backgroundSize: "cover",
      // }}
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
        onSubmit={formik.handleSubmit}
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
              name="departmentDetails.factory"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formik.values.departmentDetails.factory}
              onChange={handleFactoryChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Factory</option>
              {factories.map((factory) => (
                <option key={factory.Factory_Id} value={factory.Factory_Id}>
                  {factory.Factory_Name}
                </option>
              ))}
            </select>
            {formik.touched.departmentDetails?.factory &&
              formik.errors.departmentDetails?.factory && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.departmentDetails.factory}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentDetails.department"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formik.values.departmentDetails.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!formik.values.departmentDetails.factory}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option
                  key={department.Department_Id}
                  value={department.Department_Id}
                >
                  {department.Department_Name}
                </option>
              ))}
            </select>
            {formik.touched.departmentDetails?.department &&
              formik.errors.departmentDetails?.department && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.departmentDetails.department}
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
                name="contactPersonDetails.cName"
                value={formik.values.contactPersonDetails.cName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Name"
              />
              {formik.touched.contactPersonDetails?.cName &&
                formik.errors.contactPersonDetails?.cName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.contactPersonDetails.cName}
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
                name="contactPersonDetails.cNIC"
                value={formik.values.contactPersonDetails.cNIC}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter NIC number"
              />
              {formik.touched.contactPersonDetails?.cNIC &&
                formik.errors.contactPersonDetails?.cNIC && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.contactPersonDetails.cNIC}
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
                name="contactPersonDetails.cMobileNo"
                value={formik.values.contactPersonDetails.cMobileNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter mobile number"
              />
              {formik.touched.contactPersonDetails?.cMobileNo &&
                formik.errors.contactPersonDetails?.cMobileNo && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.contactPersonDetails.cMobileNo}
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
                name="contactPersonDetails.cEmail"
                value={formik.values.contactPersonDetails.cEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email"
              />
              {formik.touched.contactPersonDetails?.cEmail &&
                formik.errors.contactPersonDetails?.cEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.contactPersonDetails.cEmail}
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
                  name="dateTimeDetails.dateFrom"
                  value={formik.values.dateTimeDetails.dateFrom}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={today}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.dateTimeDetails?.dateFrom &&
                  formik.errors.dateTimeDetails?.dateFrom && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.dateTimeDetails.dateFrom}
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateTimeDetails.dateTo"
                  value={formik.values.dateTimeDetails.dateTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={formik.values.dateTimeDetails.dateFrom || today}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {formik.touched.dateTimeDetails?.dateTo &&
                  formik.errors.dateTimeDetails?.dateTo && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.dateTimeDetails.dateTo}
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
                    name="dateTimeDetails.fTimeFrom"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formik.values.dateTimeDetails.fTimeFrom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.dateTimeDetails?.fTimeFrom &&
                    formik.errors.dateTimeDetails?.fTimeFrom && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.dateTimeDetails.fTimeFrom}
                      </p>
                    )}
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="time"
                    name="dateTimeDetails.fTimeTo"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formik.values.dateTimeDetails.fTimeTo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.dateTimeDetails?.fTimeTo &&
                    formik.errors.dateTimeDetails?.fTimeTo && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.dateTimeDetails.fTimeTo}
                      </p>
                    )}
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
              onClick={addVehicle}
              className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Vehicle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formik.values.vehicleDetails.map((vehicle, index) => (
                  <tr key={index}>
                    <td className="md:px-4 md:py-2 whitespace-nowrap border-black/40 border">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 h-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Vehicle Type"
                        name={`vehicleDetails[${index}].VehicleType`}
                        value={vehicle.VehicleType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.vehicleDetails?.[index]?.VehicleType &&
                        formik.errors.vehicleDetails?.[index]?.VehicleType && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.vehicleDetails[index].VehicleType}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap border-black/40 border">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Vehicle Number"
                        name={`vehicleDetails[${index}].VehicleNo`}
                        value={vehicle.VehicleNo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.vehicleDetails?.[index]?.VehicleNo &&
                        formik.errors.vehicleDetails?.[index]?.VehicleNo && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.vehicleDetails[index].VehicleNo}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 max-w-10 border-0 whitespace-nowrap text-right text-sm font-medium bg-gray-50/80">
                      <div className="flex space-x-2 bg-transparent">
                        {formik.values.vehicleDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVehicle(index)}
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
              onClick={addVisitor}
              className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Visitor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formik.values.visitorDetails.map((visitor, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border border-black/40 whitespace-nowrap">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        name={`visitorDetails[${index}].visitorName`}
                        value={visitor.visitorName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Visitor Name"
                      />
                      {formik.touched.visitorDetails?.[index]?.visitorName &&
                        formik.errors.visitorDetails?.[index]?.visitorName && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.visitorDetails[index].visitorName}
                          </p>
                        )}
                    </td>
                    <td className="px-4 border border-black/40 py-2 whitespace-nowrap">
                      <input
                        type="text"
                        className="block w-full px-3 py-1 border-0 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        name={`visitorDetails[${index}].visitorNIC`}
                        value={visitor.visitorNIC}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Visitor NIC"
                      />
                      {formik.touched.visitorDetails?.[index]?.visitorNIC &&
                        formik.errors.visitorDetails?.[index]?.visitorNIC && (
                          <p className="mt-1 text-xs text-red-600">
                            {formik.errors.visitorDetails[index].visitorNIC}
                          </p>
                        )}
                    </td>
                    <td className="px-4 py-2 max-w-10 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {formik.values.visitorDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVisitor(index)}
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
                setDisableSubmitButton(!disableSubmitButton);
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
            disabled={disableSubmitButton || formik.isSubmitting}
            className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              disableSubmitButton
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {formik.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorF;
