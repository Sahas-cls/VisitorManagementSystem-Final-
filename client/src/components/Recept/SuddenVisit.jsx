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
  const validationSchema = Yup.object().shape({
    entryRequest: Yup.object().shape({
      reqDept: Yup.string().required("Please select a department"),
      reqDate: Yup.date()
        .required("Please select a date")
        .min(new Date(), "You cannot select past dates"),
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
        .min(new Date(), "Past dates for 'from' date"),
      dateTo: Yup.date()
        .required("Please select a to date")
        .min(Yup.ref("dateFrom"), "Date cannot be before 'from' date"),
      timeFrom: Yup.string().required(
        "Time required"
      ),
      timeTo: Yup.string().when("timeFrom", (timeFrom, schema) => {
        return timeFrom
          ? schema.test("is-after", "Time cannot be in past", function (value) {
              return !value || value > timeFrom;
            })
          : schema;
      }),
    }),
    // visitors: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       visitorName: Yup.string()
    //         .required("Visitor name required")
    //         .matches(/^[A-Za-z\s]{3,255}$/, "Name should only have letters"),
    //       visitorNIC: Yup.string()
    //         .required("Visitor NIC required")
    //         .matches(/^[0-9]{0,9}[vV]$|^[0-9]{12}/, "Invalid NIC format"),
    //     })
    //   )
    //   .min(1, "At least one visitor is required"),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
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
        breakfast: "",
        lunch: "",
        tea: "",
        aditionalNote: "",
      },
      visitors: [],
    },
    validationSchema,
    onSubmit: async (values) => {
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

        console.log(response.data);
        setValidationErrorsS({ success: "visit creation success" });
        swal.fire({
          title: "Suddent visit create success...!",
          text: "",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "Ok",
          cancelButtonText: "No, cancel!",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
        });
      } catch (error) {
        if (error.response) {
          setValidationErrorsS(error.response.data.errors);
          console.log(error.response.data.errors);
        } else {
          setErrorMessage(
            "An error occurred while submitting the form. Please try again later."
          );
        }
      }
    },
  });

  //to store csrf
  const [csrfToken, setCsrfToken] = useState("");
  const [departments, setDepartments] = useState({});
  const [validationErrorsS, setValidationErrorsS] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
 

  useEffect(() => {
    const factoryId = userFactoryId.userFactoryId;
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

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/department/getDep/${factoryId}`
        );
        if (response) {
          setDepartments(response.data);
        }
      } catch (error) {
        alert(error);
        console.error(`error while sending request to back-end: ${error}`);
      }
    };
    fetchDepartments();
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
  };

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
    } catch (errors) {
      const visitorErrors = {};
      errors.inner.forEach((error) => {
        visitorErrors[error.path] = error.message;
      });
      setVisitorErrors(visitorErrors);
    }
  };

  const removeItem = (index) => {
    const newVisitors = [...formik.values.visitors];
    newVisitors.splice(index, 1);
    formik.setFieldValue("visitors", newVisitors);
  };

  const [visitorErrors, setVisitorErrors] = useState({
    visitorName: "",
    visitorNIC: "",
  });

  const [disableTimeTo, setDisableTimeTo] = useState(true);

  useEffect(() => {
    if (formik.values.entryPermit.timeFrom) {
      setDisableTimeTo(false);
    }
  }, [formik.values.entryPermit.timeFrom]);

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

        <div className="text-right">
          <button
            type="submit"
            className="mr-5 bg-green-600 text-white py-1.5 px-6 mr-2 text-lg rounded-md hover:bg-green-700 mb-1"
          >
            Save
          </button>
        </div>

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
                      {formik.touched.entryRequest?.reqDept &&
                        formik.errors.entryRequest?.reqDept && (
                          <p className="error">
                            {formik.errors.entryRequest.reqDept}
                          </p>
                        )}
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
                      {formik.touched.entryRequest?.reqDate &&
                        formik.errors.entryRequest?.reqDate && (
                          <p className="error">
                            {formik.errors.entryRequest.reqDate}
                          </p>
                        )}
                      <input
                        type="Date"
                        name="entryRequest.reqDate"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.reqDate}
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      />
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
                      {formik.touched.entryRequest?.reqOfficer &&
                        formik.errors.entryRequest?.reqOfficer && (
                          <p className="error">
                            {formik.errors.entryRequest.reqOfficer}
                          </p>
                        )}
                      <input
                        type="text"
                        name="entryRequest.reqOfficer"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.reqOfficer}
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      />
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
                      {formik.touched.entryRequest?.visitorCategory &&
                        formik.errors.entryRequest?.visitorCategory && (
                          <p className="error">
                            {formik.errors.entryRequest.visitorCategory}
                          </p>
                        )}
                      <select
                        name="entryRequest.visitorCategory"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.entryRequest.visitorCategory}
                        id=""
                        className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 w-3/4 sm:text-sm"
                      >
                        <option value="">Select visitor Category</option>
                        <option value="HR services">HR Services</option>
                      </select>
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
                    {formik.touched.entryPermit?.purpose &&
                      formik.errors.entryPermit?.purpose && (
                        <p className="error">
                          {formik.errors.entryPermit.purpose}
                        </p>
                      )}
                    <select
                      name="entryPermit.purpose"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.purpose}
                      className="text-font-esm ml-0 p-1 bg-white sm:text-sm"
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
              <table className="mt-2 mb-2 overflow-auto">
                <tr>
                  <td className="m-0 p-0"></td>
                  <td className="text-font-esm sm:text-sm">From</td>
                  <td className="text-font-esm sm:text-sm">To</td>
                </tr>
                <tr>
                  <td className="text-font-esm sm:text-sm w-5">Date:</td>
                  <td className="">
                    {formik.touched.entryPermit?.dateFrom &&
                      formik.errors.entryPermit?.dateFrom && (
                        <p className="error">
                          {formik.errors.entryPermit.dateFrom}
                        </p>
                      )}
                    <input
                      type="date"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm w-full"
                      name="entryPermit.dateFrom"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.dateFrom}
                      id=""
                    />
                  </td>
                  <td className="">
                    {formik.touched.entryPermit?.dateTo &&
                      formik.errors.entryPermit?.dateTo && (
                        <p className="error">
                          {formik.errors.entryPermit.dateTo}
                        </p>
                      )}
                    <input
                      type="date"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                      name="entryPermit.dateTo"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.dateTo}
                      id=""
                    />
                  </td>
                </tr>

                <tr>
                  <td className="text-font-esm sm:text-sm">Time:</td>
                  <td>
                    {formik.touched.entryPermit?.timeFrom &&
                      formik.errors.entryPermit?.timeFrom && (
                        <p className="error">
                          {formik.errors.entryPermit.timeFrom}
                        </p>
                      )}
                    <input
                      type="time"
                      className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                      name="entryPermit.timeFrom"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.entryPermit.timeFrom}
                      id=""
                    />
                  </td>
                  <td className="w-full">
                    {formik.touched.entryPermit?.timeTo &&
                      formik.errors.entryPermit?.timeTo && (
                        <p className="error">
                          {formik.errors.entryPermit.timeTo}
                        </p>
                      )}
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
                        <p className="error">
                          &nbsp;{" "}
                          {visitorErrors.visitorName &&
                            visitorErrors.visitorName}
                        </p>
                        <input
                          name="visitorName"
                          value={visitorData.visitorName}
                          onChange={handleVisitorData}
                          className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                          type="text"
                        />
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
                        <p className="error">
                          &nbsp;{" "}
                          {visitorErrors.visitorNIC && visitorErrors.visitorNIC}
                        </p>
                        <input
                          name="visitorNIC"
                          value={visitorData.visitorNIC}
                          onChange={handleVisitorData}
                          className="bg-white border border-slate-500 p-1 rounded text-font-esm ml-0 sm:text-sm"
                          type="text"
                        />
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
                  {formik.values.visitors.length > 0 &&
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
                    ))}
                </tbody>
              </table>
              {formik.touched.visitors && formik.errors.visitors && (
                <p className="error">{formik.errors.visitors}</p>
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

        <div className="success text-center font-bold mt-12">
          {validationErrorsS.success && (
            <div className="text-center">{validationErrorsS.success}</div>
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
      </form>
    </div>
  );
};

export default SuddenVisit;
