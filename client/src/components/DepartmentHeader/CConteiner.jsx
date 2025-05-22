import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate

const CConteiner = ({
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
}) => {
  const userData = { userName, userCategory, userDepartment, userDepartmentId };
  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [visitorList, setVisitorList] = useState();
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle navigation
  const navigateTo = (visitorData) => {
    // alert("clicked");
    // Navigate to /editVisitor and pass the clicked visitor's data as state
    navigate("/editVisitorDHead", {
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
        const response = await axios.get(
          `${apiUrl}/visitor/getDepartmentVisitors/${userDepartmentId}`,
          {
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
          setErrorMessages("An unexpected error occurred.");
          alert("An unexpected error occurred.");
        }
      }
    };

    getVisitorData();
  }, []);

  return (
    <div className="cContainer">
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">
          Application for BOI Entry permits (Internal).
        </h1>

        <table className="tblVisitor">
          <thead className="bg-gray-300">
            <tr>
              <th className="pt-3 pb-3">Name</th>
              <th>NIC/PPNo</th>
              <th>Vehicle No</th>
              <th>Visiting Date</th>
            </tr>
          </thead>

          <tbody>
            {visitorList &&
              visitorList.map((visitor) => {
                // Map through vehicles to display all vehicle numbers
                const vehicleNumbers = visitor.Vehicles.map(
                  (vehicle) => vehicle.Vehicle_No
                ).join("/ ");

                return (
                  <tr key={visitor.ContactPerson_Id}>
                    <td>{visitor.ContactPerson_Name}</td>
                    <td>{visitor.ContactPerson_NIC}</td>
                    <td>{vehicleNumbers || "No vehicles"}</td>
                    <td>
                      {new Date(
                        visitor.Visits[0]?.Date_From
                      ).toLocaleDateString()}{" "}
                      &nbsp;-&nbsp;
                      {visitor.Visits[0]?.Date_To &&
                        new Date(
                          visitor.Visits[0]?.Date_To
                        ).toLocaleDateString()}
                    </td>
                    <td className="" style={{ border: "0" }}>
                      <FaArrowRight
                        onClick={() => navigateTo(visitor)} // Pass visitor data to navigateTo
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    {/* <td style={{ display: "0", border: "0", width: "0" }}></td> */}
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

export default CConteiner;
