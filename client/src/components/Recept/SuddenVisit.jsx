import React, { useEffect, useState } from "react";
import swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  // Validation Schema
  const yearsterDay = new Date();
  yearsterDay.setDate(yearsterDay.getDate() - 1);
  const validationSchema = Yup.object().shape({
    entryRequest: Yup.object().shape({
      reqDept: Yup.string().required("Please select a department"),
      reqDate: Yup.date()
        .required("Please select a date")
        .min(yearsterDay, "You cannot select past dates"),
      reqOfficer: Yup.string()
        .required("Officer name required")
        .matches(/^[A-Za-z\s]{3,255}$/, "Invalid name format"),
      visitorCategory: Yup.string().required(
        "Please select a visitor category"
      ),
    }),
    entryPermit: Yup.object().shape({
      purpose: Yup.string().required("Please select visit purpose"),
      dateFrom: Yup.date()
        .required("Date required")
        .min(yearsterDay, "Past dates for 'from' date"),
      dateTo: Yup.date()
        .required("Please select a to date")
        .min(Yup.ref("dateFrom"), "Date cannot be before 'from' date"),
      timeFrom: Yup.string().required("Time required"),
      timeTo: Yup.string()
        .required("Time required")
        .test(
          "is-after",
          "Time cannot be before 'from' time",
          function (value) {
            if (!this.parent.timeFrom || !value) return true;
            return value > this.parent.timeFrom;
          }
        ),
    }),
    visitors: Yup.array()
      .of(
        Yup.object().shape({
          visitorName: Yup.string()
            .required("Visitor name required")
            .matches(/^[A-Za-z\s]{3,255}$/, "Name should only have letters"),
          visitorNIC: Yup.string()
            .required("Visitor NIC required")
            .matches(/^[0-9]{0,9}[vV]$|^[0-9]{12}/, "Invalid NIC format"),
        })
      )
      .min(1, "At least one visitor is required"),
  });

  // Initial values for form reset
  const initialFormValues = {
    entryRequest: {
      reqDept: "",
      reqDate: "",
      reqOfficer: "",
      visitorCategory: "",
    },
    entryPermit: {
      purpose: "",
      dateFrom: "",
      dateTo: "",
      timeFrom: "",
      timeTo: "",
    },
    mealplan: {
      breakfast: false,
      lunch: false,
      tea: false,
      aditionalNote: "",
    },
    visitors: [],
  };

  // Formik initialization
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post(
          `${apiUrl}/visitor/createSuddenvisit`,
          {
            userFactoryId: userFactoryId,
            entryRequest: values.entryRequest,
            entryPermit: values.entryPermit,
            visitorsData: values.visitors,
            mealplan: values.mealplan,
          },
          {
            headers: { "x-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );

        setValidationErrorsS({ success: "Visit creation successful" });
        swal.fire({
          title: "Sudden visit created successfully!",
          text: "",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
        });
        resetForm();
        setVisitorData({ visitorName: "", visitorNIC: "" });
      } catch (error) {
        if (error.response?.data?.errors) {
          setValidationErrorsS(error.response.data.errors);
        } else {
          setValidationErrorsS({
            general:
              "An error occurred while submitting the form. Please try again later.",
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  //to store csrf
  const [csrfToken, setCsrfToken] = useState("");
  const [departments, setDepartments] = useState([]);
  const [validationErrorsS, setValidationErrorsS] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  const [visitorCategory, setvisitorCategory] = useState([]);
  const [visitorPurposes, setvisitorPurposes] = useState([]);

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
      }
    } catch (error) {
      console.error("Error fetching visitor categories:", error);
      setvisitorCategory([]);
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

      if (result.status === 200) {
        setvisitorPurposes(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching visiting purposes:", error);
      setvisitorPurposes([]);
    }
  };

  useEffect(() => {
    const factoryId = userFactoryId.userFactoryId;
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          const csrf = await response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        console.error(`Error while fetching csrf token: ${error}`);
      }
    };
    getCsrf();

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/department/getDep/${factoryId}`
        );
        if (response) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error(`Error while fetching departments: ${error}`);
        setDepartments([]);
      }
    };
    fetchDepartments();
    getVCategories();
  }, []);

  const [visitorData, setVisitorData] = useState({
    visitorName: "",
    visitorNIC: "",
  });

  const handleVisitorData = (e) => {
    const { name, value } = e.target;
    setVisitorData({
      ...visitorData,
      [name]: value,
    });
    // Clear error when user types
    if (visitorErrors[name]) {
      setVisitorErrors({
        ...visitorErrors,
        [name]: "",
      });
    }
  };

  const [visitorErrors, setVisitorErrors] = useState({
    visitorName: "",
    visitorNIC: "",
  });

  const handleVisitorPlusButton = () => {
    try {
      const visitorSchema = Yup.object().shape({
        visitorName: Yup.string()
          .required("Visitor name required")
          .matches(/^[A-Za-z\s]{3,255}$/, "Name should only have letters"),
        visitorNIC: Yup.string()
          .required("Visitor NIC required")
          .matches(/^[0-9]{0,9}[vV]$|^[0-9]{12}/, "Invalid NIC format"),
      });

      visitorSchema.validateSync(visitorData, { abortEarly: false });

      formik.setFieldValue("visitors", [
        ...formik.values.visitors,
        visitorData,
      ]);

      setVisitorData({
        visitorName: "",
        visitorNIC: "",
      });
      setVisitorErrors({
        visitorName: "",
        visitorNIC: "",
      });
    } catch (errors) {
      const newErrors = {};
      errors.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setVisitorErrors(newErrors);
    }
  };

  const removeItem = (index) => {
    const newVisitors = [...formik.values.visitors];
    newVisitors.splice(index, 1);
    formik.setFieldValue("visitors", newVisitors);
  };

  const [disableTimeTo, setDisableTimeTo] = useState(true);

  useEffect(() => {
    if (formik.values.entryPermit.timeFrom) {
      setDisableTimeTo(false);
    } else {
      setDisableTimeTo(true);
      formik.setFieldValue("entryPermit.timeTo", "");
    }
  }, [formik.values.entryPermit.timeFrom]);

  // Reset form function
  const handleReset = () => {
    formik.resetForm();
    setVisitorData({
      visitorName: "",
      visitorNIC: "",
    });
    setVisitorErrors({
      visitorName: "",
      visitorNIC: "",
    });
    setValidationErrorsS({});
    setDisableTimeTo(true);
  };

  // Helper function to display field errors
  const displayError = (touched, error) => {
    return touched && error ? (
      <div className="text-red-600 text-xs mt-1 flex items-center">
        <FaExclamationCircle className="mr-1" />
        {error}
      </div>
    ) : null;
  };

  // Helper function to display server errors
  const displayServerErrors = () => {
    if (!validationErrorsS || Object.keys(validationErrorsS).length === 0) {
      return null;
    }

    if (validationErrorsS.success) {
      return (
        <div className="success text-center font-bold mt-4 bg-green-300/70 py-4 rounded-md">
          <div className="text-center flex justify-center items-center">
            <FaCheckCircle className="mr-2" />
            {validationErrorsS.success}
          </div>
        </div>
      );
    }

    return (
      <div className="error text-center px-8 font-bold rounded-md bg-red-100 py-2 my-2">
        {Object.entries(validationErrorsS).map(([field, error]) => (
          <div
            key={field}
            className="text-red-600 flex items-center justify-center"
          >
            <FaExclamationCircle className="mr-2" />
            {error.msg || error}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "white" }}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="">
          <h1 className="text-md mt-2 mb-2 text-center text-xl font-extrabold">
            Sudden Visit application for BOI entry permits (Internal)
          </h1>
        </div>

        <div className="text-right mr-2">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mr-5 bg-green-600 text-white py-1.5 px-6 text-lg rounded-md hover:bg-green-700 mb-1 disabled:opacity-50"
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="mr-5 bg-red-600 text-white py-1.5 px-6 text-lg rounded-md hover:bg-red-700 mb-1"
          >
            Reset
          </button>
        </div>

        <div className="px-2">{displayServerErrors()}</div>

        <div className="w-full">
          <div className="w-full p-2 lg:flex gap-[1%]">
            {/* top left */}
            <div className=" border-black p-1 rounded-lg shadow-custom1 bg-gradient-to-br from-blue-200 to-blue-300 lg:w-[50%] h-72">
              <h1 className="text-lg text-blue-950 mb-2">
                Entry permit request details
              </h1>
              <table className="w-full text-sm mb-2">
                <tbody>
                  <tr className="">
                    <td className="w-1/12 sm:w-3/12">
                      <label
                        className="text-font-esm whitespace-nowrap sm:text-sm"
                        htmlFor="req-dept"
                      >
                        Requested Dept:{" "}
                      </label>
                    </td>
                    <td>
                      <select
                        name="entryRequest.reqDept"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.reqDept}
                        id="req-dept"
                        className="text-font-esm ml-0 p-1 bg-white w-3/4 sm:text-sm rounded border border-black"
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
                      {displayError(
                        formik.touched.entryRequest?.reqDept,
                        formik.errors.entryRequest?.reqDept
                      )}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="w-1/12">
                      <label
                        className="text-font-esm whitespace-nowrap sm:text-sm"
                        htmlFor=""
                      >
                        Requested Date:{" "}
                      </label>
                    </td>
                    <td>
                      <input
                        type="Date"
                        name="entryRequest.reqDate"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.reqDate}
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      />
                      {displayError(
                        formik.touched.entryRequest?.reqDate,
                        formik.errors.entryRequest?.reqDate
                      )}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="w-1/12">
                      <label
                        className="text-font-esm whitespace-nowrap sm:text-sm"
                        htmlFor=""
                      >
                        Requested Officer:
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        name="entryRequest.reqOfficer"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.reqOfficer}
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      />
                      {displayError(
                        formik.touched.entryRequest?.reqOfficer,
                        formik.errors.entryRequest?.reqOfficer
                      )}
                    </td>
                  </tr>

                  <tr className="">
                    <td className="w-1/12">
                      <label
                        className="text-font-esm whitespace-nowrap sm:text-sm"
                        htmlFor=""
                      >
                        Visitor Category:{" "}
                      </label>
                    </td>
                    <td>
                      <select
                        name="entryRequest.visitorCategory"
                        onChange={(e) => {
                          formik.handleChange(e);
                          getVisitingPurpose(e.target.value);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.visitorCategory}
                        id=""
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      >
                        <option value="">Select visitor Category</option>
                        {Array.isArray(visitorCategory) &&
                          visitorCategory.map((vCategory) => (
                            <option
                              value={vCategory.visitor_category_id}
                              key={vCategory.visitor_category_id}
                            >
                              {vCategory.visitor_category}
                            </option>
                          ))}
                      </select>
                      {displayError(
                        formik.touched.entryRequest?.visitorCategory,
                        formik.errors.entryRequest?.visitorCategory
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* top right */}
            <div className="mt-5 border-black p-1 rounded-lg shadow-custom1 bg-gradient-to-br from-blue-200 to-blue-300 lg:w-[50%] h-72 lg:mt-0">
              <h1 className="text-lg text-blue-950 mb-2">
                Entry permit details
              </h1>
              <table>
                <tr>
                  <td className="w-auto">
                    <label
                      className="text-font-esm whitespace-nowrap sm:text-sm"
                      htmlFor=""
                    >
                      Purpose:{" "}
                    </label>
                  </td>
                  <td>
                    <select
                      name="entryPermit.purpose"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.purpose}
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      id=""
                    >
                      <option value="">Select a purpose</option>
                      {Array.isArray(visitorPurposes) &&
                        visitorPurposes.map((purpose) => (
                          <option
                            value={purpose.visiting_purpose_id}
                            key={purpose.visiting_purpose_id}
                          >
                            {purpose.visiting_purpose}
                          </option>
                        ))}
                    </select>
                    {displayError(
                      formik.touched.entryPermit?.purpose,
                      formik.errors.entryPermit?.purpose
                    )}
                  </td>
                </tr>
              </table>

              {/* date and time details */}
              <table className="mt-2 mb-2 overflow-auto">
                <tr>
                  <td className="m-0 p-0"></td>
                  <td className="text-font-esm sm:text-sm">From</td>
                  <td className="text-font-esm sm:text-sm">To</td>
                </tr>
                <tr>
                  <td className="text-font-esm sm:text-sm w-5">Date:</td>
                  <td className="">
                    <input
                      type="date"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm w-full"
                      name="entryPermit.dateFrom"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.dateFrom}
                      id=""
                    />
                    {displayError(
                      formik.touched.entryPermit?.dateFrom,
                      formik.errors.entryPermit?.dateFrom
                    )}
                  </td>
                  <td className="">
                    <input
                      type="date"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                      name="entryPermit.dateTo"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.dateTo}
                      id=""
                    />
                    {displayError(
                      formik.touched.entryPermit?.dateTo,
                      formik.errors.entryPermit?.dateTo
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="text-font-esm sm:text-sm">Time:</td>
                  <td>
                    <input
                      type="time"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                      name="entryPermit.timeFrom"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.timeFrom}
                      id=""
                    />
                    {displayError(
                      formik.touched.entryPermit?.timeFrom,
                      formik.errors.entryPermit?.timeFrom
                    )}
                  </td>
                  <td className="w-full">
                    <input
                      type="time"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                      name="entryPermit.timeTo"
                      disabled={disableTimeTo}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.timeTo}
                      id=""
                    />
                    {displayError(
                      formik.touched.entryPermit?.timeTo,
                      formik.errors.entryPermit?.timeTo
                    )}
                  </td>
                </tr>
              </table>
            </div>
          </div>

          {/* bottom */}
          <div className="w-full p-2 lg:flex gap-[1%]">
            {/* Visitor Details */}
            <div className="border-black p-1 rounded-lg shadow-custom1 bg-gradient-to-br from-blue-200 to-blue-300 lg:w-2/4">
              <h1 className="text-lg text-blue-950 mb-2">Visitor Details</h1>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="">
                        <label
                          className="text-font-esm whitespace-nowrap sm:text-sm"
                          htmlFor=""
                        >
                          Name:{" "}
                        </label>
                        <input
                          name="visitorName"
                          value={visitorData.visitorName}
                          onChange={handleVisitorData}
                          className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                          type="text"
                        />
                        {visitorErrors.visitorName && (
                          <div className="text-red-600 text-xs mt-1 flex items-center">
                            <FaExclamationCircle className="mr-1" />
                            {visitorErrors.visitorName}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="">
                        <label
                          className="text-font-esm whitespace-nowrap sm:text-sm"
                          htmlFor=""
                        >
                          NIC:{" "}
                        </label>
                        <input
                          name="visitorNIC"
                          value={visitorData.visitorNIC}
                          onChange={handleVisitorData}
                          className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                          type="text"
                        />
                        {visitorErrors.visitorNIC && (
                          <div className="text-red-600 text-xs mt-1 flex items-center">
                            <FaExclamationCircle className="mr-1" />
                            {visitorErrors.visitorNIC}
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      className="sv-icons cursor-pointer text-2xl float-start"
                      style={{ width: "1%" }}
                    >
                      <FaPlusCircle
                        className="text-sm sm:text-xl"
                        onClick={handleVisitorPlusButton}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full mt-3 mb-5">
                <thead>
                  <th
                    className="text-font-esm sm:text-sm"
                    style={{ textAlign: "center" }}
                  >
                    Name
                  </th>
                  <th
                    className="text-font-esm sm:text-sm"
                    style={{ textAlign: "center" }}
                  >
                    NIC
                  </th>
                </thead>

                <tbody>
                  {formik.values.visitors.length > 0 ? (
                    formik.values.visitors.map((visitor, index) => (
                      <tr key={index}>
                        <td
                          className="border border-black text-font-esm p-0 pl-1 sm:text-sm sm:p-2"
                          style={{ margin: "0", height: "10px" }}
                        >
                          {visitor.visitorName}
                        </td>
                        <td
                          className="border border-black text-font-esm p-0 pl-1 sm:text-sm sm:p-2"
                          style={{ margin: "0", height: "10px" }}
                        >
                          {visitor.visitorNIC}
                        </td>
                        <td style={{ width: "1%" }}>
                          <MdDelete
                            onClick={() => removeItem(index)}
                            className="text-red-600 cursor-pointer text-lg"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-2 text-sm">
                        No visitors added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {formik.touched.visitors && formik.errors.visitors && (
                <div className="text-red-600 text-xs mt-1 flex items-center">
                  <FaExclamationCircle className="mr-1" />
                  {formik.errors.visitors}
                </div>
              )}
            </div>

            {/* right div */}
            <div className="border-black p-1 rounded-lg shadow-custom1 bg-gradient-to-br mt-5 lg:mt-0 from-blue-200 to-blue-300 lg:w-[50%]">
              <h1 className="text-lg text-blue-950 mb-2">Meal plan</h1>
              &nbsp;
              <div className="">
                <input
                  type="checkbox"
                  name="mealplan.breakfast"
                  onChange={formik.handleChange}
                  checked={formik.values.mealplan.breakfast}
                  className="ml-1"
                  id="Breakfast"
                />{" "}
                <label
                  htmlFor="Breakfast"
                  className="sv-span text-font-esm sm:text-sm mr-2"
                >
                  Breakfast
                </label>
                <input
                  type="checkbox"
                  className="sv-checkboxes"
                  onChange={formik.handleChange}
                  name="mealplan.lunch"
                  checked={formik.values.mealplan.lunch}
                  id="Lunch"
                />{" "}
                <label
                  htmlFor="Lunch"
                  className="sv-span text-font-esm sm:text-sm"
                >
                  Lunch
                </label>
                <input
                  type="checkbox"
                  onChange={formik.handleChange}
                  className="sv-checkboxes ml-2"
                  name="mealplan.tea"
                  checked={formik.values.mealplan.tea}
                  id="tea"
                />{" "}
                <label
                  htmlFor="tea"
                  className="sv-span text-font-esm sm:text-sm"
                >
                  Tea
                </label>
              </div>
              <div className="mb-5 ml-2">
                <h3 className="mt-3 text-black">Additional Note: </h3>
                <textarea
                  cols={window.screen.width > 728 ? 60 : 40}
                  rows={window.screen.width > 728 ? 5 : 4}
                  name="mealplan.aditionalNote"
                  onChange={formik.handleChange}
                  value={formik.values.mealplan.aditionalNote}
                  id=""
                  className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SuddenVisit;
