import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseWindowWidth from "../UseWindowWidth";
import "./CContainer.css";

const CConteiner = ({
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
  const [visitorList, setVisitorList] = useState();
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const windowWidth = UseWindowWidth();

  const navigateTo = (visitorData) => {
    navigate("/editVisitor", {
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
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

    const getVisitorData = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/visitor/getDepartmentVisitors`,
          {
            params: {
              userDepartmentId: userDepartmentId,
              userFactoryId: userFactoryId,
            },
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (response) {
          setVisitorList(response.data.data);
        }
      } catch (error) {
        if (error.isAxiosError) {
          let errorMessage = "An error occurred.";
          if (error.response) {
            switch (error.response.status) {
              case 400:
                setErrorMessages("Bad request. Please check your input.");
                break;
              case 404:
                setErrorMessages("Resource page not found.");
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
          alert(errorMessage);
        } else {
          setErrorMessages("An unexpected error occurred1.");
        }
      }
    };

    getVisitorData();
  }, []);

  return (
    <div className="cContainer" style={{ backgroundColor: "white" }}>
      <form action="" onSubmit={() => alert("submitting")} className="w-full px-2">
        <h1 className="text-md text-center text-lg mt-2 mb-2 font-extrabold">
          New Visitors List.
        </h1>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]"> {/* Minimum width to prevent squeezing */}
            <table className="w-full">
              <thead className="position-sticky">
                <tr>
                  <th className="whitespace-nowrap pt-1 pb-1 text-left border-0 bg-blue-500 text-white text-sm px-2">
                    Name
                  </th>
                  <th className="whitespace-nowrap border-0 bg-blue-500 text-white text-left text-sm px-2">
                    NIC/PPNo
                  </th>
                  <th className="whitespace-nowrap border-0 bg-blue-500 text-white text-left text-sm px-2">
                    Vehicle Type
                  </th>
                  <th className="whitespace-nowrap border-0 bg-blue-500 text-white text-left text-sm px-2">
                    Vehicle No
                  </th>
                  <th className="whitespace-nowrap border-0 bg-blue-500 text-white text-left text-sm px-2">
                    Visiting Date
                  </th>
                  <th className="whitespace-nowrap border-0 bg-blue-500 text-white text-left text-sm px-2">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {visitorList && visitorList.length > 0 ? (
                  visitorList.map((visitor) => {
                    const vehicleNumbers = visitor.Vehicles.map(
                      (vehicle) => vehicle.Vehicle_No
                    ).join(", ");

                    const vehicleType = visitor.Vehicles.map(
                      (vehicle) => vehicle.Vehicle_Type
                    ).join(", ");

                    return (
                      <tr
                        className="odd:bg-blue-100 even:bg-blue-300 text-sm"
                        key={visitor.ContactPerson_Id}
                      >
                        <td className="whitespace-nowrap p-2 border-r-2 border-white text-sm">
                          {visitor.ContactPerson_Name}
                        </td>
                        <td className="p-2 border-r-2 border-white text-sm">
                          {visitor.ContactPerson_NIC}
                        </td>
                        <td className="p-2 border-r-2 border-white text-sm">
                          {vehicleType || "No vehicles"}
                        </td>
                        <td className="p-2 border-r-2 border-white text-sm">
                          {vehicleNumbers || "No vehicles"}
                        </td>
                        <td className="p-2 border-r-2 border-white text-sm">
                          <div className="h-full flex gap-1">
                            <div className="border-r border-black pr-1">
                              {new Date(
                                visitor.Visits[0]?.Date_From
                              ).toLocaleDateString()}
                            </div>
                            <div>
                              {visitor.Visits[0]?.Date_To &&
                                new Date(
                                  visitor.Visits[0]?.Date_To
                                ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <FaRegEye
                            onClick={() => navigateTo(visitor)}
                            className="hover:text-red-600 text-lg hover:scale-110 duration-300 mx-auto"
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center italic py-1">
                      No visitors yet!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {errorMessages && <p className="error text-red-600">{errorMessages}</p>}
      </form>
    </div>
  );
};

export default CConteiner;