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
    <div
      className="bg-white w-screen px-2"
      style={{ backgroundColor: "white" }}
    >
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">Incoming Visitors List.</h1>

        <div className="w-full overflow-x-auto">
          <table className="tblVisitor">
            <thead className="bg-blue-400">
              <tr>
                <th className="pt-3 pb-3 border-0 text-white border-b-4 border-white">
                  Name
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  NIC/PPNo
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  Vehicle Type
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  Vehicle No
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  Visiting Date
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  Reference
                </th>
                <th className="border-0 text-white border-b-4 border-white">
                  Check In/Out
                </th>
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
                    <tr
                      className="odd:bg-blue-100 even:bg-blue-200 border-b border-white hover:border-black hover:border-2 hover:text-black"
                      key={visitor.ContactPerson_Id}
                    >
                      <td
                        className="border border-white"
                        style={{ border: "0", textAlign: "left" }}
                      >
                        {visitor.ContactPerson_Name}
                      </td>
                      <td
                        className="border border-white"
                        style={{ border: "0", borderLeft: "1px solid white" }}
                      >
                        {visitor.ContactPerson_NIC}
                      </td>
                      <td
                        className="border border-white"
                        style={{ border: "0", borderLeft: "1px solid white" }}
                      >
                        {vehicleType || "No vehicles"}
                      </td>
                      <td
                        className="border border-white"
                        style={{ border: "0", borderLeft: "1px solid white" }}
                      >
                        {vehicleNumbers || "No vehicles"}
                      </td>
                      <td
                        className="border border-white"
                        style={{
                          display: "",
                          border: "0",
                          borderLeft: "1px solid white",
                        }}
                      >
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
                      <td
                        style={{ border: "0", borderLeft: "1px solid white" }}
                      >
                        {visitor.Visits[0].Reference_No}
                      </td>
                      <td
                        style={{ border: "0", borderLeft: "1px solid white" }}
                        className="flex flex-col items-center gap-[-10px]"
                      >
                        <div className=" flex w-full justify-around">
                          {isCheckedIn ? (
                            <div className="py-1 px-1 w-1/2 rounded-lg text-center">
                              {isCheckedIn}
                            </div>
                          ) : (
                            <button
                              className="bg-blue-300 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                              onClick={(e) =>
                                handleCheckIn(e, visitor.Visits[0])
                              }
                            >
                              Check in
                            </button>
                          )}
                          <br />
                          {isCheckedOut ? (
                            <div className="py-1 px-1 w-1/2 rounded-lg text-center">
                              {isCheckedOut}
                            </div>
                          ) : (
                            <button
                              onClick={(e) =>
                                handleCheckOut(e, visitor.Visits[0])
                              }
                              className="bg-blue-300 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                            >
                              Check out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {errorMessages && <p className="error text-red-600">{errorMessages}</p>}
      </form>
    </div>
  );
};

export default SConteiner;
