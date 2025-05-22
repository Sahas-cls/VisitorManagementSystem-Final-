import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
import UseWindowWidth from "../UseWindowWidth";
import "./CContainer.css"

const CTrackStatus = ({
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

  useEffect(() => {
    console.log(windowWidth);
    if (windowWidth < 520) {
      setToggleSidebar(false);
    } else {
      setToggleSidebar(true);
    }
  }, [windowWidth]);

  return (
    <div className="cContainer">
      {/* <p>{userFactoryId !== undefined ? userFactoryId : "User Name"}</p> */}
      {/* <p>{userDepartmentId !== undefined ? userDepartmentId : "User Name"}</p> */}
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">Edited Visitors.</h1>

        <table className="tblVisitor">
          <thead className="bg-gray-300">
            <tr>
              <th className="pt-3 pb-3">Name</th>
              <th>NIC/PPNo</th>
              <th>Vehicle Type</th>
              <th>Vehicle No</th>
              <th>Visiting Date</th>
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
                  <tr key={visitor.ContactPerson_Id}>
                    <td>{visitor.ContactPerson_Name}</td>
                    <td>{visitor.ContactPerson_NIC}</td>
                    <td>{vehicleType || "No vehicles"}</td>
                    <td>{vehicleNumbers || "No vehicles"}</td>
                    <td style={{ display: "" }}>
                      <div className="flex h-full">
                        <div className="w-1/2 text-center h-full border-r border-black">
                          {new Date(
                            visitor.Visits[0]?.Date_From
                          ).toLocaleDateString()}{" "}
                        </div>
                        <div className="w-1/2 text-center h-full border-black">
                          {visitor.Visits[0]?.Date_To &&
                            new Date(
                              visitor.Visits[0]?.Date_To
                            ).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td style={{ width: "1%", border: "0" }}>
                      <FaRegEye
                        onClick={() => navigateTo(visitor)}
                        className="hover:text-red-600 font-bolder"
                        style={{ cursor: "pointer", fontSize: "1.4rem" }}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No records yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {errorMessages && <p className="error text-red-600">{errorMessages}</p>}
      </form>
    </div>
  );
};

export default CTrackStatus;
