import React, { useEffect, useState } from "react";
import { FaFilter, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import UseWindowWidth from "../UseWindowWidth";
import "./CContainer.css";

const CApprovedVisitors = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
  setToggleSidebar,
}) => {
  const userData = {
    userId,
    userName,
    userCategory,
    userDepartment,
    userDepartmentId,
    userFactoryId,
  };

  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorList, setVisitorList] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const windowWidth = UseWindowWidth();

  // 🔹 Fetch CSRF Token once
  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          setCsrfToken(response.data.csrfToken);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();
  }, []);

  // 🔹 Function to fetch all approved visitors initially
  const getVisitorData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/visitor/selectEditedVisitors-CUser`,
        {
          params: {
            userDepartmentId,
            userFactoryId,
            userId,
          },
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (response) {
        setVisitorList(response.data.data);
      }
    } catch (error) {
      console.error(error);
      handleAxiosError(error);
    }
  };

  // 🔹 Run default data fetch
  useEffect(() => {
    getVisitorData();
  }, [csrfToken]);

  // 🔹 Handle backend errors
  const handleAxiosError = (error) => {
    if (error.isAxiosError) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessages("Bad request. Please check your input.");
            break;
          case 404:
            // setErrorMessages("No visitors found for provided date range.");
            break;
          case 500:
            setErrorMessages("Internal server error.");
            break;
          default:
            setErrorMessages("An unexpected error occurred.");
        }
      } else if (error.request) {
        setErrorMessages(
          "Network error. Please check your internet connection."
        );
      }
    } else {
      setErrorMessages("An unexpected error occurred.");
    }
  };

  // 🔹 Navigation to edit visitor
  const navigateTo = (visitorData) => {
    navigate("/editVisitor", {
      state: { visitor: visitorData, userData },
    });
  };

  const today = new Date().toISOString().split("T")[0];
  console.log("today == ", today);

  // 🔹 Filter function (called when Formik submits)
  const onFilter = async (values, { setSubmitting }) => {
    try {
      console.log("Filter applied:", values);

      // ✅ Write your filter Axios request here
      // Example backend call with query params:
      const response = await axios.get(
        `${apiUrl}/visitor/filterVisitorsByDate`,
        {
          params: {
            from: values.from,
            to: values.to,
            apMe: values.apMe,
            userDepartmentId,
            userFactoryId,
            userId,
          },
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      // ✅ Update visitor list with filtered data
      if (response && response.data.data) {
        setVisitorList(response.data.data);
        setErrorMessages("");
      }
    } catch (error) {
      console.error("Filter request failed:", error);
      handleAxiosError(error);
      setVisitorList({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="w-full p-0 m-0 overflow-x-scroll sm:overflow-x-hidden"
      style={{ backgroundColor: "white" }}
    >
      {/* ---------- FILTER COMPONENT ---------- */}
      <div className="w-full bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="w-full bg-white shadow-sm rounded-lg px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Title */}
          <h1 className="text-base font-semibold text-gray-700 text-center sm:text-left">
            Allowed Visitors
          </h1>

          {/* ✅ Formik Filter Form */}
          <Formik
            initialValues={{ from: today, to: today, apMe: true }}
            onSubmit={onFilter}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                <div className="flex items-center text-gray-600 text-sm font-medium">
                  <FaFilter className="mr-1 text-blue-500" /> Filter
                </div>

                <div className="flex items-center gap-1">
                  <label htmlFor="from" className="text-xs text-gray-600">
                    From
                  </label>
                  <Field
                    id="from"
                    name="from"
                    type="date"
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <label htmlFor="to" className="text-xs text-gray-600">
                    To
                  </label>
                  <Field
                    id="to"
                    name="to"
                    type="date"
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                <div className="flex space-x-2 text-xs">
                  <Field type="checkbox" id="aMe" name="apMe" />
                  <label htmlFor="aMe" className="cursor-pointer text-sm">
                    Approved by me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md transition"
                >
                  {isSubmitting ? "Loading..." : "Apply"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* ---------- VISITOR TABLE ---------- */}
      <div className="w-full overflow-x-auto md:overflow-hidden">
        <table className="w-full ml-1">
          <thead>
            <tr>
              <th className="pt-1 pb-1 border-0 bg-blue-500 text-white text-left text-sm">
                Name
              </th>
              <th className="border-0 bg-blue-500 text-white text-left text-sm">
                NIC/PPNo
              </th>
              <th className="border-0 bg-blue-500 text-white text-left text-sm">
                Vehicle Type
              </th>
              <th className="border-0 bg-blue-500 text-white text-left text-sm">
                Vehicle No
              </th>
              <th className="border-0 bg-blue-500 text-white text-left text-sm">
                Visiting Date
              </th>
              <th className="border-0"></th>
            </tr>
          </thead>

          <tbody>
            {visitorList && visitorList.length > 0 ? (
              visitorList.map((visitor) => {
                const vehicleNumbers = visitor.Vehicles.map(
                  (v) => v.Vehicle_No
                ).join(", ");
                const vehicleType = visitor.Vehicles.map(
                  (v) => v.Vehicle_Type
                ).join(", ");

                return (
                  <tr
                    className="odd:bg-blue-100 even:bg-blue-300"
                    key={visitor.ContactPerson_Id}
                  >
                    <td className="p-2 border-r-2 text-sm border-white">
                      {visitor.ContactPerson_Name}
                    </td>
                    <td className="p-2 border-r-2 text-sm border-white">
                      {visitor.ContactPerson_NIC}
                    </td>
                    <td className="p-2 border-r-2 text-sm border-white">
                      {vehicleType || "No vehicles"}
                    </td>
                    <td className="p-2 border-r-2 text-sm border-white">
                      {vehicleNumbers || "No vehicles"}
                    </td>
                    <td className="p-2 text-sm border-white">
                      <div className="flex justify-center md:gap-1">
                        <div className="w-1/2 text-center">
                          {new Date(
                            visitor.Visits[0]?.Date_From
                          ).toLocaleDateString()}
                        </div>
                        <div className="w-1/2 text-center">
                          {visitor.Visits[0]?.Date_To &&
                            new Date(
                              visitor.Visits[0]?.Date_To
                            ).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td
                      className="bg-white"
                      style={{ width: "1%", border: "0" }}
                    >
                      <FaRegEye
                        onClick={() => navigateTo(visitor)}
                        className="hover:text-red-600 font-bolder text-lg sm:text-xl cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center italic">
                  No records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {errorMessages && <p className="error text-red-600">{errorMessages}</p>}
    </div>
  );
};

export default CApprovedVisitors;
