import React, { useEffect, useState } from "react";
import "./RContainer.css";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import "./RDashboard.css";
import { useFormik } from "formik";
import * as yup from "yup";

const RDashboard = () => {
  const [csrfToken, setCsrfToken] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

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
  }, [apiUrl]);

  const validationSchema = yup.object({
    dateFrom: yup.date().required("From date is required"),
    dateTo: yup
      .date()
      .required("To date is required")
      .min(yup.ref("dateFrom"), "To Date cannot be earlier than From date"),
  });

  const formik = useFormik({
    initialValues: {
      dateFrom: "",
      dateTo: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (values.dateFrom && values.dateTo) {
        try {
          setIsLoading(true);
          const response = await axios.post(
            `${apiUrl}/visitor/generateExcelRepo`,
            values,
            {
              headers: {
                "X-CSRF-Token": csrfToken,
              },
              withCredentials: true,
              responseType: "blob",
            }
          );

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "generated-report.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("Error generating or downloading the Excel file:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        alert("Please provide both 'dateFrom' and 'dateTo' to generate the report.");
      }
    },
  });

  return (
    <div className="w-full min-h-full flex justify-center">
      <div
        className="flex px-2 w-full h-100vh justify-center items-center md:h-2/4"
        style={{ backgroundColor: "white" }}
      >
        {isLoading && (
          <div className="text-center w-full h-full">
            <div className="loader-overlay w-full h-full">
              <div className="loader"></div>
            </div>
          </div>
        )}
        <form
          onSubmit={formik.handleSubmit}
          className="border border-gray-500 shadow-custom1 rounded-md p-5 mt-14 boxShadow md:w-[60%] bg-gradient-to-bl from-blue-100 to-blue-300 h-full flex flex-col justify-center items-center"
        >
          <h1 className="text-md mt-2 mb-8 font-extrabold">
            Select a date period
          </h1>
          <table className="">
            <tbody>
              <tr className="">
                <td className="p-1">
                  <label className="text-font-esm md:text-sm" htmlFor="dateFrom">
                    From
                  </label>
                </td>
                <td className="p-1">
                  <input
                    className="text-font-esm md:text-sm border border-slate-500 bg-white p-1 rounded-md"
                    type="date"
                    name="dateFrom"
                    id="dateFrom"
                    value={formik.values.dateFrom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.dateFrom && formik.errors.dateFrom && (
                    <div className="text-red-600 text-xs">
                      {formik.errors.dateFrom}
                    </div>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-1">
                  <label className="text-font-esm md:text-sm" htmlFor="dateTo">
                    To
                  </label>
                </td>
                <td className="p-1">
                  <input
                    className="text-font-esm md:text-sm border border-slate-500 bg-white p-1 rounded-md"
                    type="date"
                    name="dateTo"
                    id="dateTo"
                    value={formik.values.dateTo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.dateTo && formik.errors.dateTo && (
                    <div className="text-red-600 text-xs">
                      {formik.errors.dateTo}
                    </div>
                  )}
                </td>
              </tr>

              <tr>
                <td colSpan={2} className="text-left">
                  <button
                    type="submit"
                    className="py-1 px-3 bg-green-500 hover:bg-green-600 rounded-md hover:text-white font-bold mt-8"
                    disabled={isLoading}
                  >
                    <span className="flex justify-center items-center">
                      <FaDownload className="text-font-esm md:text-sm mr-1" />
                      <p className="text-font-esm md:text-sm">
                        {isLoading ? "Processing..." : "Download"}
                      </p>
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
};

export default RDashboard;