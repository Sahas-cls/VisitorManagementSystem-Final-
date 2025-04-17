import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate
import "./DContainer.css";

const DConteiner = ({
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

  // console.log("user data dcontainer: ", userData);

  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorList, setVisitorList] = useState();

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle navigation
  const navigateTo = (visitorData) => {
    // alert("clicked");
    // Navigate to /editVisitor and pass the clicked visitor's data as state
    navigate("/approve-dhead", {
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
          `http://localhost:3000/visitor/getVisitors-dhead`,
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
    <div className="dContainer" style={{ backgroundColor: "white" }}>
      {/* <h1>4654: {userId || 123}</h1> */}
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="text-md mt-2 font-extrabold">New Visitors</h1>

        <table className="w-full">
          <thead className="">
            <tr>
              <th className="pt-1 text-left pb-1 text-left  border-0 bg-blue-500 text-white">Name</th>
              <th className="border-0 bg-blue-500 text-white text-left">NIC/PPNo</th>
              <th className="border-0 bg-blue-500 text-white text-left">Vehicle Type</th>
              <th className="border-0 bg-blue-500 text-white text-left">Vehicle No</th>
              <th className="border-0 bg-blue-500 text-white text-left">Visiting Date</th>
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
                  <tr className="odd:bg-blue-100 even:bg-blue-300" key={visitor.ContactPerson_Id}>
                    <td className="p-2 border-r border-black">{visitor.ContactPerson_Name}</td>
                    <td className="p-2 border-r border-black">{visitor.ContactPerson_NIC}</td>
                    <td className="p-2 border-r border-black">{vehicleType || "No vehicles"}</td>
                    <td className="p-2 border-r border-black">{vehicleNumbers || "No vehicles"}</td>
                    <td className="td-Dates td-dates p-2 border-r-0 border-black flex flex-col md:flex-row gap-1 w-auto">
                      <div className="w-auto md:w-1/2 text-center h-full border-r pr-1 border-black">
                        {new Date(
                          visitor.Visits[0]?.Date_From
                        ).toLocaleDateString()}{" "}
                      </div>

                      <div className="w-auto md:w-1/2 text-center h-full border-black ">
                        {visitor.Visits[0]?.Date_To &&
                          new Date(
                            visitor.Visits[0]?.Date_To
                          ).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ width: "1%", border: "0", background: "white" }}>
                      <FaRegEye
                        onClick={() => navigateTo(visitor)}
                        className="hover:text-red-600 font-bolder text-sm"
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center italic">
                  There are no visitors yet
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

export default DConteiner;
