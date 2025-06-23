import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Header";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { LuMessageSquareText } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import axios from "axios";
import { IoIosSave, IoIosSend } from "react-icons/io";
import { FaPlusCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import swal from "sweetalert2";
import "./RContainer.css";
import { useFormik } from "formik";
import * as yup from "yup";

const RDisplayVisitor = () => {
  const location = useLocation();
  const visitor = location.state?.visitor; // Access the passed visitor data
  const approvalStatus = true;

  console.log(
    "All details: ======================================================"
  );
  console.log(location.state);

  console.log("state", location.state);
  console.log("visitor ======", visitor);

  const contactPersonEmail = visitor.ContactPerson_Email || "";
  const contactPersonMNo = visitor.ContactPerson_ContactNo;

  const Visitor = location.state?.visitor;
  const [visitorGroup, setVisitorGroup] = useState(
    location.state?.visitor.Visitors
  );
  const UserData = location.state?.userData;
  const [Vehicles, setVehicles] = useState(location.state?.visitor.Vehicles);
  const Visits = location.state?.visitor.Visits[0];
  const [isLoading, setIsLoading] = useState(false);

  console.log("visits", Visits.Requested_Officer);
  console.log("user data from display data: ", UserData);
  console.log("visitors", visitor);
  console.log("visitor group", visitorGroup);
  console.log("vehicle group", Vehicles);

  const { userName, userCategory, userDepartment, userId } = UserData;
  const [departmentList, setDepartmentList] = useState({});
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState();
  const [serverErroors, setServerErrors] = useState({});
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [isSaved, setisSaved] = useState(false);
  const [visitorCategory, setvisitorCategory] = useState({});
  const [visitorPurposes, setvisitorPurposes] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

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
        console.log("getting v categories", result.data);
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
      console.log("result134 ======= ", result);

      if (result.status === 200) {
        console.log("visiting data list:- ", result.data.data);
        setvisitorPurposes(result.data.data);
      }
    } catch (error) {
      alert("failed");
      setvisitorPurposes({});
    }
  };

  const navigate = useNavigate();

  const navigateTo = () => {
    navigate("/edit-visit-recept", {
      state: { visitor: visitor },
    });
  };

  const VisitId = Visitor.Visits[0]?.Visit_Id;

  const handleEntryPermit = (e) => {
    const { name, value } = e.target;
    setEntryPermit({
      ...entryPermit,
      [name]: value === "" || value === null ? defaultValue : value,
    });
  };

  const handlePerson = (e) => {
    const { name, value, checked, type } = e.target;
    setPerson({
      ...person,
      [name]: type === "checkbox" ? checked : value,
    });
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

  const handleWhatsappMessage = () => {
    const ufMobileNo = Visitor.ContactPerson_ContactNo;

    const formatMNo = (ufMNo) => {
      if (ufMNo.startsWith("0")) {
        return "94" + ufMNo.slice(1);
      }
      return ufMNo;
    };

    const fMobileNo = formatMNo(ufMobileNo);
    const phoneNumber = fMobileNo;

    const message =
      `Dear ${Visitor.ContactPerson_Name},\n\n` +
      `Thank you for your upcoming visit. Please find your *BOI reference number* below,\n` +
      `which you will need to present upon entry.\n\n` +
      `*BOI Reference Number:* *${formik.values.refNumber}*\n\n` +
      `Thanks,\n` +
      `Receptionist\n` +
      `Concord Group`;

    navigator.clipboard
      .writeText(message)
      .then(() => {})
      .catch((err) => {
        console.error("Clipboard copy failed:", err);
      });

    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          const csrf = await response.data.csrfToken;
          console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
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
          console.log("department list: ", visitorList.data.data);
          setDepartmentList(visitorList.data.data);
        }
      } catch (error) {
        setErrorMessages(error.message);
      }
    };
    getDepartments();
    getVCategories();
    getVisitingPurpose(Visits.Visitor_Category);
  }, []);

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

  const handleSubmit = async (values) => {
    let formData = {
      userId: userId,
      Visit_Id: VisitId,
      Reference_Details: {
        refNumber: values.refNumber,
        issuedDate: values.issuedDate,
      },
    };

    try {
      const response = await axios.post(
        `${apiUrl}/visitor/updateVisitors-reception`,
        formData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      console.log("response ", response);
      setisSaved(true);
      if (response) {
        if (response.status === 200) {
          setIsLoading(false);
          swal.fire({
            title: "Visit update success",
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
      if (error.isAxiosError) {
        let errorMessage = "An error occurred.";

        if (error.response) {
          switch (error.response.status) {
            case 400:
              if (
                error.response.data.errors &&
                error.response.data.errors.length > 0
              ) {
                const validationErrors = error.response.data.errors
                  .map((err) => err.msg)
                  .join(", ");
                setErrorMessages(validationErrors);
                errorMessage = validationErrors;
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
                error.response.data.message || "An unexpected error occurred.";
          }
        } else if (error.request) {
          setErrorMessages(
            "Network error. Please check your internet connection."
          );
          errorMessage =
            "Network error. Please check your internet connection.";
        }

        alert(errorMessage);
      } else {
        setErrorMessages("An unexpected error occurred.");
        alert("An unexpected error occurred.");
        console.error("Error:", error);
      }
    }
    console.log("error or success", successOrError);
  };

  const [disableSave, setDisableSave] = useState(true);
  const disableSaveButton = (e) => {
    e.preventDefault();
    setDisableSave(false);
  };

  const handleSaveButton = (e) => {
    e.preventDefault();
    try {
      const response = axios.post(
        `${apiUrl}/visitor/update-visit-reception`,
        () => {}
      );
    } catch (error) {}
  };

  const [emailSuccessMsg, setEmailSuccessMsg] = useState();
  const [serverSideErrors, setServerSideErrors] = useState({});
  const [recMessages, setRecMessages] = useState();

  const handleSendEmail = async (e) => {
    alert("sending email");
    let formData = {
      userId: userId,
      Visit_Id: VisitId,
      Reference_Details: {
        refNumber: formik.values.refNumber,
        issuedDate: formik.values.issuedDate,
      },
    };
    e.preventDefault();
    console.log(contactPersonEmail);
    if (contactPersonEmail !== "" && contactPersonEmail !== null) {
      try {
        const response = await axios.post(
          `${apiUrl}/visitor/sendEmail`,
          { formData: formData, contactPersonEmail: contactPersonEmail },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          alert("Email sent successfully");
          setRecMessages("");
          setServerSideErrors("");
          setEmailSuccessMsg("Email sent successfully");
        }
      } catch (error) {
        console.log(error);

        if (error.response) {
          if (error.response.data && error.response.data.errors) {
            const errorMessages = error.response.data.errors
              .map((err) => err.msg)
              .join("* ");
            setServerSideErrors(errorMessages);
          } else {
            setServerSideErrors(
              "Mail sending failed. Please send the reference number to the user via mobile."
            );
          }
        } else {
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
    const newVehicle = [...Vehicles, { VehicleNo: "", VehicleType: "" }];
    setVehicles(newVehicle);
    if (Object.keys(vehicleError).length === 0) {
    }
  };

  const removeVisitor = (e, index) => {
    alert(index);
    e.preventDefault();
    const updatedVisitors = visitorGroup.filter((_, i) => i !== index);
    setVisitorGroup(updatedVisitors);
  };

  const removeVehicle = (e, index) => {
    e.preventDefault();
    const updatedVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    const updatedErrors = { ...vehicleErrors };
    delete updatedErrors[index];
    setVehicleErrors(updatedErrors);
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const validationSchema = yup.object({
    refNumber: yup.string().required("Reference number required"),
    issuedDate: yup
      .date()
      .required("Issued date required")
      .min(yesterday, "Date cannot be in past"),
  });

  const formik = useFormik({
    initialValues: {
      refNumber: "",
      issuedDate: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="w-full flex flex-col mb-4 bg-white">
      <form>
        <Header
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
        />
        <div className="flex flex-col lg:flex-row">
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className="mb-0 bg-white w-full">
            <div className="flex items-center mb-4 md:mb-0 gap-5 my-3">
              <FaPersonCircleExclamation className="text-sky-600 text-4xl md:text-5xl lg:text-6xl mr-3" />
              <h1 className="text-2xl md:text-3xl font-bold text-sky-600">
                {Visitor.ContactPerson_Name}
              </h1>
            </div>

            <div className="p-0">
              <div className="m-0 p-2 flex flex-col lg:flex-row gap-4 lg:gap-[2%]">
                <div className="bg-gradient-to-tr from-sky-100 to-sky-200 w-full rounded-lg shadow-custom1 lg:w-[49%] p-2 h-auto min-h-[190px] pb-5">
                  <h1 className="font-bold text-lg text-blue-950 mb-2">
                    Entry Permit Request Details
                  </h1>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Request Dep: <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="Requested_Department"
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        disabled={approvalStatus}
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
                    </div>
                    {errors.Requested_Department && (
                      <p className="error text-sm">
                        {errors.Requested_Department}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Requested Date: <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        name="Date_From"
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        defaultValue={`${reqDate}`}
                        disabled={approvalStatus}
                      />
                    </div>
                    {errors.Date_From && (
                      <p className="error text-sm">{errors.Date_From}</p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Requested Officer:{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        name="Requested_Officer"
                        defaultValue={Visits.Requested_Officer}
                        type="text"
                        disabled={approvalStatus}
                      />
                    </div>
                    {errors.Requested_Officer && (
                      <p className="error text-sm">
                        {errors.Requested_Officer}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Visitor Category:{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="Visitor_Category"
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        value={Visits.visitor_category_id}
                        disabled={approvalStatus}
                      >
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
                                Visits.Visitor_Category ==
                                vCategory.visitor_category_id
                              }
                            >
                              {vCategory.visitor_category}
                            </option>
                          ))}
                      </select>
                    </div>
                    {errors.Visitor_Category && (
                      <p className="error text-sm">{errors.Visitor_Category}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-sky-100 to-sky-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] h-auto min-h-[190px] pb-5">
                  <h1 className="font-bold text-lg text-blue-950 mb-2">
                    Entry permit Details
                  </h1>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm sm:w-1/3">
                        Purpose: <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="Purpose"
                        className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                        disabled={approvalStatus}
                      >
                        <option
                          value=""
                          selected={
                            Visits.Purpose === "" || Visits.Purpose === null
                          }
                        >
                          Select a Purpose
                        </option>

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
                      <p className="error text-sm">{errors.Purpose}</p>
                    )}

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
                            name="Date_From"
                            defaultValue={reqDate}
                            disabled={approvalStatus}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm">To</label>
                          <input
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="date"
                            name="Date_To"
                            defaultValue={dateTo >= today ? dateTo : null}
                            disabled={approvalStatus}
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

                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="text-sm sm:w-1/3">
                        Time: <span className="text-red-600">*</span>
                      </label>
                      <div className="flex flex-1 gap-2">
                        <div className="flex-1">
                          <input
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="time"
                            name="Time_From"
                            defaultValue={timeFrom}
                            disabled={approvalStatus}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            className="text-sm w-full bg-white border rounded border-slate-400 p-1"
                            type="time"
                            name="Time_To"
                            defaultValue={timeTo}
                            disabled={approvalStatus}
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

              <div className="m-0 p-2 flex flex-col lg:flex-row gap-4 lg:gap-[2%]">
                <div className="bg-gradient-to-tr from-sky-100 to-sky-200  p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px]">
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
                              <td className="text-sm border border-slate-600">
                                {visitor.Visitor_Name}
                              </td>
                              <td className="text-sm border border-slate-600">
                                {visitor.Visitor_NIC}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-lg text-blue-950 mb-2 text-center">
                      Meal Plan
                    </h3>
                    <div className="flex justify-center gap-4 mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="Breakfast"
                          defaultChecked={Visits.Breakfast === true}
                          id="Breakfast"
                          className="mr-1"
                          defaultValue={timeTo}
                          disabled={approvalStatus}
                        />
                        <label htmlFor="Breakfast" className="text-sm">
                          Breakfast
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="Lunch"
                          id="Lunch"
                          defaultChecked={Visits.Lunch === true}
                          className="mr-1"
                          defaultValue={timeTo}
                          disabled={approvalStatus}
                        />
                        <label htmlFor="Lunch" className="text-sm">
                          Lunch
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="Tea"
                          defaultChecked={Visits.Tea === true}
                          id="Tea"
                          className="mr-1"
                          defaultValue={timeTo}
                          disabled={approvalStatus}
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
                        type="text"
                        name="Remark"
                        className="text-sm bg-white border rounded border-slate-400 p-1 w-full"
                        defaultValue={Visits.Remark}
                        readOnly={true}
                        disabled={approvalStatus}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-sky-100 to-sky-200 p-3 w-full rounded-lg shadow-custom1 lg:w-[49%] min-h-[330px]">
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
                                {vehicle.Vehicle_No}
                              </td>
                              <td className="text-sm border border-black">
                                {vehicle.Vehicle_Type}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div
                className={`${successOrError.type} === "error" ? "error" : "success"`}
              >
                <p className="text-center mt-4 font-bold text-sm">
                  {successOrError.msg}
                </p>
              </div>
              <div className="text-center">
                <p className="error text-sm">{errorMessages}</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="w-full px-2 flex justify-center md:mt-0 mt-[-5px]">
        <div className="bg-gradient-to-tr from-sky-100 to-sky-200 rounded-lg shadow-custom1 p-4 w-full lg:w-6/6">
          <div className="text-center">
            <h1 className="font-bold text-lg text-blue-950 mb-4">
              Entry permit Reference & Issue
            </h1>
          </div>
          <form
            className="w-full max-w-md mx-auto"
            onSubmit={formik.handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm sm:w-1/3">Reference Number:</label>
                <div className="">
                  <input
                    type="text"
                    name="refNumber"
                    value={formik.values.refNumber}
                    className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.refNumber && formik.errors.refNumber && (
                    <div className="text-red-600 text-sm">
                      {formik.errors.refNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm sm:w-1/3">Issued Date:</label>
                <div className="">
                  <input
                    type="date"
                    name="issuedDate"
                    value={formik.values.issuedDate}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    className="text-sm bg-white border rounded border-slate-400 p-1 flex-1"
                  />
                  {formik.touched.issuedDate && formik.errors.issuedDate && (
                    <div className="text-red-600 text-sm">
                      {formik.errors.issuedDate}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-4 pt-3">
              <button
                type="submit"
                className="flex items-center text-sm px-4 py-1 border-2 border-black/50 shadow-custom1 bg-gray-300 rounded hover:bg-blue-200 disabled:opacity-50 hover:scale-105"
              >
                <IoIosSave className="mr-1 text-3xl" />
              </button>

              {isSaved && (
                <button
                  type="button"
                  disabled={!isSaved}
                  className="flex items-center justify-center text-sm px-4 py-1 border-black/50 shadow-custom1 border-2 bg-gray-300 rounded hover:bg-blue-300 hover:scale-105 disabled:opacity-50"
                  onClick={(e) => {
                    disableSaveButton;
                    handleSendEmail(e);
                  }}
                >
                  <MdOutlineMail className="mr-1 text-3xl text-[#1A73E8]" />
                </button>
              )}

              {isSaved && (
                <button
                  type="button"
                  className="flex items-center text-sm px-4 py-1 border-black/50 shadow-custom1 bg-gray-300 border-2 rounded hover:bg-green-300/40 hover:scale-105 hover:text-white"
                  onClick={handleWhatsappMessage}
                >
                  <FaWhatsapp className="text-3xl text-green-700" />
                </button>
              )}
            </div>
          </form>

          <div className="text-center">
            {emailSuccessMsg &&
              (typeof emailSuccessMsg === "string"
                ? emailSuccessMsg.trim() !== ""
                : Object.keys(emailSuccessMsg).length > 0) && (
                <p className="text-green-600 font-bold text-sm">
                  {typeof emailSuccessMsg === "object"
                    ? JSON.stringify(emailSuccessMsg)
                    : emailSuccessMsg}
                </p>
              )}

            {serverSideErrors &&
              (typeof serverSideErrors === "string"
                ? serverSideErrors.trim() !== ""
                : Object.keys(serverSideErrors).length > 0) && (
                <p className="text-red-600 font-bold text-sm">
                  {typeof serverSideErrors === "object"
                    ? JSON.stringify(serverSideErrors)
                    : serverSideErrors}
                </p>
              )}

            {recMessages &&
              (typeof recMessages === "string"
                ? recMessages.trim() !== ""
                : Object.keys(recMessages).length > 0) && (
                <p className="text-blue-600 font-bold text-sm">
                  {typeof recMessages === "object"
                    ? JSON.stringify(recMessages)
                    : recMessages}
                </p>
              )}
          </div>

          <div className="flex justify-center gap-3 mt-6 pb-4">
            {/* <button
              onClick={navigateTo}
              className="bg-green-600 py-2 w-20 md:w-28 px-3 rounded-md text-sm text-white hover:bg-green-800 shadow-lg"
            >
              Update
            </button> */}

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-blue-600 py-2 w-20 md:w-28 px-3 rounded-md text-sm text-white hover:bg-blue-800 shadow-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDisplayVisitor;
