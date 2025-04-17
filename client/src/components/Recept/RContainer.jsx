import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RContainer.css";

const RContainer = ({
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
  };

  // console.log("user data dcontainer: ", userData);

  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorList, setVisitorList] = useState();

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle navigation
  const navigateTo = (visitorData) => {
    // alert("clicked");
    // Navigate to /editVisitor and pass the clicked visitor's data as state
    navigate("/approve-reception", {
      state: { visitor: visitorData, userData: userData },
    });
  };

  // alert("dhead component")

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
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
      // alert(userDepartmentId);
      try {
        const response = await axios.get(
          `http://localhost:3000/visitor/getVisitors-reception`,
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
          console.log("respose:  ", response.data.data);
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
          setErrorMessages("An unexpected error occurred.");
          alert("An unexpected error occurred.");
        }
      }
    };

    getVisitorData();
  }, []);

  return (
    <div className="rContainer">
      {/* <h1>{userDepartmentId}</h1> */}
      {/* <h1>4654: {userId || 123}</h1> */}
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">Visitors List</h1>

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
            {visitorList &&
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
                        {/* &nbsp;-&nbsp; */}

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
              })}
          </tbody>
        </table>

        {errorMessages && <p className="error text-red-600">{errorMessages}</p>}
      </form>
    </div>
  );
};

export default RContainer;
