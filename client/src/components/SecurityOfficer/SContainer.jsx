import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseWindowWidth from "../UseWindowWidth";
import "./SContainer";

const SConteiner = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
  setToggleSidebar,
}) => {
  console.log("user factory ", userFactoryId);
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
  const [checkedVisitors, setCheckedVisitors] = useState({});

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

    const getVisitorData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/visitor/getDepartmentVisitors-securityVisitor`,
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

          // Initialize checkedVisitors state with existing check-in/out times
          const initialChecked = {};
          response.data.data.forEach((visitor) => {
            const visit = visitor.Visits[0];
            if (visit.Check_In || visit.Check_Out) {
              initialChecked[visit.Visit_Id] = {
                checkedIn: visit.Check_In,
                checkedOut: visit.Check_Out,
              };
            }
          });
          setCheckedVisitors(initialChecked);
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

  useEffect(() => {
    console.log(windowWidth);
  }, [windowWidth]);

  const handleCheckIn = async (e, visit) => {
    e.preventDefault();
    console.log("visits ================== ", visit);
    const nowDT = new Date().toLocaleString();

    try {
      let formData = { currentDate: nowDT, visit: visit };
      const response = await axios.post(
        "http://localhost:3000/visitor/updateChackIn",
        formData,
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      if (response.status === 200) {
        setCheckedVisitors((prev) => ({
          ...prev,
          [visit.Visit_Id]: {
            ...prev[visit.Visit_Id],
            checkedIn: nowDT,
          },
        }));
      }
    } catch (error) {
      alert("Error updating check-in");
    }
  };

  const handleCheckOut = async (e, visit) => {
    e.preventDefault();
    const nowDT = new Date().toLocaleString();

    try {
      let formData = { currentDate: nowDT, visit: visit };
      const response = await axios.post(
        "http://localhost:3000/visitor/updateChackOut",
        formData,
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      console.log("res status: ");

      if (response.status === 200) {
        setCheckedVisitors((prev) => ({
          ...prev,
          [visit.Visit_Id]: {
            ...prev[visit.Visit_Id],
            checkedOut: nowDT,
          },
        }));

        console.log(checkedVisitors);
      }
    } catch (error) {
      alert("Error updating check-out");
    }
  };

  return (
    <div className="cContainer">
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">Incoming Visitors List.</h1>

        <table className="tblVisitor">
          <thead className="bg-gray-300">
            <tr>
              <th className="pt-3 pb-3">Name</th>
              <th>NIC/PPNo</th>
              <th>Vehicle Type</th>
              <th>Vehicle No</th>
              <th>Visiting Date</th>
              <th>Reference</th>
              <th>Check In/Out</th>
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

                const visitId = visitor.Visits[0]?.Visit_Id;
                const isCheckedIn = checkedVisitors[visitId]?.checkedIn;
                const isCheckedOut = checkedVisitors[visitId]?.checkedOut;

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
                    <td>{visitor.Visits[0].Reference_No}</td>
                    <td
                      style={{
                        borderRight: "1px solid black",
                        borderLeft: "1px solid white",
                        borderTop: "1px solid white",
                      }}
                      className="flex flex-col items-center gap-[-10px]"
                    >
                      {isCheckedIn ? (
                        <div className="py-1 px-1 w-30 rounded-lg text-center">
                          {isCheckedIn}
                        </div>
                      ) : (
                        <button
                          className="py-1 px-1 w-20 bg-slate-400 mb-2 hover:bg-slate-500 rounded-lg hover:text-white"
                          onClick={(e) => handleCheckIn(e, visitor.Visits[0])}
                        >
                          Check in
                        </button>
                      )}
                      <br />
                      {isCheckedOut ? (
                        <div className="py-1 px-1 w-30 rounded-lg text-center">
                          {isCheckedOut}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleCheckOut(e, visitor.Visits[0])}
                          className="py-1 px-1 w-20 mt-[-15px] bg-slate-400 hover:bg-slate-500 rounded-lg hover:text-white"
                        >
                          Check out
                        </button>
                      )}
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

export default SConteiner;
