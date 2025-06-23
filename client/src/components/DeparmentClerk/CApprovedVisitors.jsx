import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
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
  const [visitorList, setVisitorList] = useState();
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate(); // Initialize useNavigate hook

  // *Using the custom hook to get window width
  const windowWidth = UseWindowWidth();
  // console.log(windowWidth);
  // Function to handle navigation
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

    // Fetch visitor data
    const getVisitorData = async () => {
      try {
        // alert("sending request 7 days")
        const response = await axios.get(
          `${apiUrl}/visitor/selectEditedVisitors-CUser`,
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
        if (response) {
          setVisitorList(response.data.data);
        }
      } catch (error) {
        console.error(error);
        // Handle Axios errors
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
          // alert("An unexpected error occurred512.");
        }
      }
    };

    getVisitorData();
  }, []);

  // useEffect(() => {
  //   console.log(windowWidth);
  //   if (windowWidth < 520) {
  //     setToggleSidebar(false);
  //   } else {
  //     setToggleSidebar(true);
  //   }
  // }, [windowWidth]);

  return (
    <div
      className="w-full p-0 m-0 overflow-x-scroll sm:overflow-x-hidden"
      style={{ backgroundColor: "white" }}
    >
      {/* <p>{userFactoryId !== undefined ? userFactoryId : "User Name"}</p> */}
      {/* <p>{userDepartmentId !== undefined ? userDepartmentId : "User Name"}</p> */}
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="text-md text-center text-lg mt-2 mb-2 font-extrabold">Allowed Visitors.</h1>

        <div className="w-full overflow-x-auto md:overflow-hidden">
          <table className="w-full ml-1">
            <thead className="">
              <tr className="">
                <th className="pt-1 text-left pb-1 text-left  border-0 bg-blue-500 text-white text-[11px] text-sm">
                  Name
                </th>
                <th className=" border-0 bg-blue-500 text-white text-left text-sm">
                  NIC/PPNo
                </th>
                <th className=" border-0 bg-blue-500 text-white text-left text-sm">
                  Vehicle Type
                </th>
                <th className=" border-0 bg-blue-500 text-white text-left text-sm">
                  Vehicle No
                </th>
                <th className=" border-0 bg-blue-500 text-white text-left text-sm">
                  Visiting Date
                </th>
                <th className="border-0"></th>
              </tr>
            </thead>

            <tbody>
              {visitorList && visitorList.length > 0 ? (
                visitorList.map((visitor) => {
                  const vehicleNumbers = visitor.Vehicles.map(
                    (vehicle) => vehicle.Vehicle_No
                  ).join("/n");

                  const vehicleType = visitor.Vehicles.map(
                    (vehicle) => vehicle.Vehicle_Type
                  ).join("/n");

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
                      <td className="p-2 border-r-0 border-black w-auto text-sm">
                        <div className="h-full md:flex md:gap-1">
                          <div className="w-1/2 text-center md:pr-1 md:h-full md:border-r border-black mb-0">
                            {new Date(
                              visitor.Visits[0]?.Date_From
                            ).toLocaleDateString()}{" "}
                          </div>
                          <div className="w-1/2 text-center md:h-full border-black">
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
                          className="hover:text-red-600 font-bolder text-lg sm:text-xl"
                          style={{ cursor: "pointer" }}
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
      </form>
    </div>
  );
};

export default CApprovedVisitors;
