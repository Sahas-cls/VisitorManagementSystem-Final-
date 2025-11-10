import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye, FaFilter } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import "./HContainer.css";

const HApprovedVisitors = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
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
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  // Function to handle navigation
  const navigateTo = (visitorData) => {
    navigate("/editVisitor-HR", {
      state: { visitor: visitorData, userData: userData },
    });
  };

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
        console.error(`Error while fetching csrf token:- ${error}`);
        setErrorMessages("Failed to load security token");
      }
    };
    getCsrf();
  }, [apiUrl]);

  // Filter function
  const onFilter = async (values, { setSubmitting }) => {
    try {
      console.log("Filter applied:", values);

      const response = await axios.get(
        `${apiUrl}/visitor/filterApprovedVisitorsByDate-Hr`,
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

      if (response && response.data.data) {
        setVisitorList(response.data.data);
        setErrorMessages("");
      }
    } catch (error) {
      console.error("Filter request failed:", error);
      handleAxiosError(error);
      setVisitorList([]);
    } finally {
      setSubmitting(false);
    }
  };

  // Error handling function
  const handleAxiosError = (error) => {
    let errorMessage = "An error occurred while filtering data.";
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = "Bad request. Please check your filter criteria.";
          break;
        case 404:
          errorMessage = "No visitors found for the selected filter.";
          break;
        case 500:
          errorMessage = "Internal server error.";
          break;
        default:
          errorMessage = "An unexpected error occurred.";
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    setErrorMessages(errorMessage);
  };

  // Fetch all visitor data (initial load)
  const getVisitorData = async () => {
    if (!csrfToken) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/visitor/approvedVisitors-Hr`,
        {
          params: {
            userDepartmentId: userDepartmentId,
            userFactoryId: userFactoryId,
            userId: userId,
          },
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (response.data?.data) {
        setVisitorList(response.data.data);
      } else {
        setVisitorList([]);
      }
    } catch (error) {
      console.error("Error fetching visitor data:", error);
      handleAxiosError(error);
      setVisitorList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVisitorData();
  }, [csrfToken, userDepartmentId, userFactoryId, userId, apiUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Initial form values for filter
  const initialFilterValues = {
    from: "",
    to: "",
    apMe: false,
  };

  return (
    <div className="hContainer" style={{ backgroundColor: "white" }}>
      <div className="w-full">
        <div className="w-full bg-white shadow-sm rounded-lg px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          {/* Title */}
          <h1 className="text-md font-extrabold text-center sm:text-left text-lg">
            Approved Visitors
          </h1>

          {/* Filter Form using Formik */}
          <Formik initialValues={initialFilterValues} onSubmit={onFilter}>
            {({ isSubmitting, handleSubmit }) => (
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
                  <Field
                    type="checkbox"
                    id="aMe"
                    name="apMe"
                    className="cursor-pointer"
                  />
                  <label htmlFor="aMe" className="cursor-pointer text-sm">
                    Approved by me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs px-3 py-1 rounded-md transition"
                >
                  {isSubmitting ? "Applying..." : "Apply"}
                </button>

                {/* Reset filter button */}
                <button
                  type="button"
                  onClick={getVisitorData}
                  className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md transition"
                >
                  Reset
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="position-sticky">
              <tr>
                <th className="pt-1 text-left pb-1 border-0 bg-blue-500 text-white text-sm">
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
                <th className="border-0 bg-blue-500 text-white text-left text-sm">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 border border-black"
                  >
                    Loading visitors...
                  </td>
                </tr>
              ) : visitorList && visitorList.length > 0 ? (
                visitorList.map((visitor, index) => {
                  const vehicleNumbers =
                    visitor.Vehicles?.map((vehicle) => vehicle.Vehicle_No).join(
                      ", "
                    ) || "No vehicles";

                  const vehicleType =
                    visitor.Vehicles?.map(
                      (vehicle) => vehicle.Vehicle_Type
                    ).join(", ") || "No vehicles";

                  return (
                    <tr
                      className="odd:bg-blue-100 even:bg-blue-300 text-sm"
                      key={`${visitor.ContactPerson_Id}-${index}`}
                    >
                      <td className="p-1 border-r-2 border-white text-sm">
                        {visitor.ContactPerson_Name || "N/A"}
                      </td>
                      <td className="p-1 border-r-2 border-white text-sm">
                        {visitor.ContactPerson_NIC || "N/A"}
                      </td>
                      <td className="p-1 border-r-2 border-white text-sm">
                        {vehicleType}
                      </td>
                      <td className="p-1 border-r-2 border-white text-sm">
                        {vehicleNumbers}
                      </td>
                      <td className="p-2 border-r-0 border-black w-auto text-sm">
                        <div className="h-full md:flex md:gap-1">
                          <div className="w-1/2 text-center md:pr-1 md:h-full md:border-r border-black mb-0">
                            {formatDate(visitor.Visits?.[0]?.Date_From)}
                          </div>
                          <div className="w-1/2 text-center md:h-full border-black">
                            {formatDate(visitor.Visits?.[0]?.Date_To)}
                          </div>
                        </div>
                      </td>
                      <td className="bg-white p-2" style={{ width: "1%" }}>
                        <FaRegEye
                          onClick={() => navigateTo(visitor)}
                          className="hover:text-red-600 text-lg hover:scale-110 duration-300 cursor-pointer"
                          title="View Details"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 italic">
                    {errorMessages || "There are no visitors yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {errorMessages && !isLoading && (
          <p className="error text-red-600 text-center mt-4">{errorMessages}</p>
        )}
      </div>
    </div>
  );
};

export default HApprovedVisitors;
