import React, { useEffect, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UseWindowWidth from "../UseWindowWidth";
import "./SContainer";
import { IoMdSearch } from "react-icons/io";
import { LuRefreshCcw } from "react-icons/lu";
import { IoArrowUndo } from "react-icons/io5";
import swal from "sweetalert2";

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
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const windowWidth = UseWindowWidth();

  // Helper function to format time consistently
  const formatTime = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  const navigateTo = (visitorData) => {
    navigate("/editVisitor", {
      state: { visitor: visitorData, userData: userData },
    });
  };

  const getVisitorData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/visitor/getDepartmentVisitors-securityVisitor`,
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
        console.log("data from backend", response.data.data);
        // Initialize checkedVisitors state with existing check-in/out times
       
        const initialChecked = {};
        if (Array.isArray(response?.data?.data)) {
        response.data.data.forEach((visitor) => {
          const visit = visitor.Visits[0];
          if (visit.Check_In || visit.Check_Out) {
            initialChecked[visit.Visit_Id] = {
              checkedIn: visit.Check_In,
              checkedOut: visit.Check_Out,
            };
           }
         });
        }
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
    getVisitorData();
  }, []);

  // const handleCheckIn = async (e, visit) => {
  //   e.preventDefault();
  //   const now = new Date();
  //   const nowDT = now.toISOString(); // Store as ISO string

  //   try {
  //     let formData = { currentDate: nowDT, visit: visit };
  //     const response = await axios.post(
  //       "http://localhost:3000/visitor/updateChackIn",
  //       formData,
  //       { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
  //     );

  //     if (response.status === 200) {
  //       setCheckedVisitors((prev) => ({
  //         ...prev,
  //         [visit.Visit_Id]: {
  //           ...prev[visit.Visit_Id],
  //           checkedIn: nowDT,
  //         },
  //       }));
  //     }
  //   } catch (error) {
  //     alert("Error updating check-in");
  //   }
  // };

  const handleCheckIn = async (e, visit) => {
    e.preventDefault();

    const { value: action } = await swal.fire({
      title: "Check-In Time",
      text: "Choose how to set the check-in time",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Current Time",
      denyButtonText: "Add Custom Time",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    let selectedDateTime = null;

    if (action === true) {
      // User chose "Current Time"
      selectedDateTime = new Date().toISOString();
    } else if (action === false) {
      // User chose "Add Custom Time"
      const { value: customTime } = await swal.fire({
        title: "Enter Date and Time",
        input: "datetime-local",
        inputLabel: "Choose a custom check-in date and time",
        inputAttributes: {
          step: 1, // allows seconds
        },
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please enter a valid date and time";
          }
        },
      });

      if (!customTime) {
        return; // User cancelled
      }

      selectedDateTime = new Date(customTime).toISOString();
    } else {
      return; // Cancel button was clicked
    }

    try {
      let formData = { currentDate: selectedDateTime, visit: visit };
      const response = await axios.post(
        `${apiUrl}/visitor/updateChackIn`,
        formData,
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      if (response.status === 200) {
        setCheckedVisitors((prev) => ({
          ...prev,
          [visit.Visit_Id]: {
            ...prev[visit.Visit_Id],
            checkedIn: selectedDateTime,
          },
        }));
      }
    } catch (error) {
      swal.fire("Error", "Error updating check-in", "error");
    }
  };

  // const handleCheckOut = async (e, visit) => {
  //   e.preventDefault();
  //   const now = new Date();
  //   const nowDT = now.toISOString(); // Store as ISO string

  //   try {
  //     let formData = { currentDate: nowDT, visit: visit };
  //     const response = await axios.post(
  //       "http://localhost:3000/visitor/updateChackOut",
  //       formData,
  //       { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
  //     );

  //     if (response.status === 200) {
  //       setCheckedVisitors((prev) => ({
  //         ...prev,
  //         [visit.Visit_Id]: {
  //           ...prev[visit.Visit_Id],
  //           checkedOut: nowDT,
  //         },
  //       }));
  //     }
  //   } catch (error) {
  //     alert("Error updating check-out");
  //   }
  // };

  const handleCheckOut = async (e, visit) => {
    e.preventDefault();

    const { value: action } = await swal.fire({
      title: "Check-Out Time",
      text: "Choose how to set the check-out time",
      showDenyButton: true,
      confirmButtonText: "Current Time",
      denyButtonText: "Add Custom Time",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    let selectedDateTime = null;

    if (action === true) {
      // User chose "Current Time"
      selectedDateTime = new Date().toISOString();
    } else if (action === false) {
      // User chose "Add Custom Time"
      const { value: customTime } = await swal.fire({
        title: "Enter Date and Time",
        input: "datetime-local",
        inputLabel: "Choose a custom check-out date and time",
        inputAttributes: {
          step: 1,
        },
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please enter a valid date and time";
          }
        },
      });

      if (!customTime) {
        return; // User cancelled
      }

      selectedDateTime = new Date(customTime).toISOString();
    } else {
      return; // Cancel button was clicked
    }

    try {
      let formData = { currentDate: selectedDateTime, visit: visit };
      const response = await axios.post(
        `${apiUrl}/visitor/updateChackOut`,
        formData,
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      if (response.status === 200) {
        setCheckedVisitors((prev) => ({
          ...prev,
          [visit.Visit_Id]: {
            ...prev[visit.Visit_Id],
            checkedOut: selectedDateTime,
          },
        }));
      }
    } catch (error) {
      swal.fire("Error", "Error updating check-out", "error");
    }
  };

  const handleRefresh = () => {
    getVisitorData();
  };

  const [searchKey, setsearchKey] = useState("");
  const handleSearchChanges = (e) => {
    setsearchKey(e.target.value);
  };

  const handleSearchByName = async () => {
    if (searchKey === "") {
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/visitor/getDepartmentVisitors-securityVisitor/${searchKey}`,
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      if (response.status === 200) {
        setVisitorList(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUndoCheckOut = async (e, visit) => {
    e.preventDefault();

    const result = await swal.fire({
      title: "Please confirm your action",
      text: "Are you sure you want to undo the check-out time?",
      icon: "question",
      showCancelButton: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/visitor/undoCheckOut`,
        { Visit_Id: visit },
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setCheckedVisitors((prev) => {
          const newState = { ...prev };
          if (newState[visit.Visit_Id]) {
            delete newState[visit.Visit_Id].checkedOut;
          }
          return newState;
        });

        getVisitorData();
      }
    } catch (error) {
      alert("Error undoing check-out");
      console.error(error);
    }
  };

  const handleUndoCheckIn = async (e, visit) => {
    e.preventDefault();
    const result = await swal.fire({
      title: "Please confirm your action",
      text: "Are you sure want to undo the check out time",
      icon: "question",
      showCancelButton: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/visitor/undoCheckIn`,
        { visit },
        { headers: { "X-CSRF-Token": csrfToken }, withCredentials: true }
      );

      if (response.status === 200) {
        setCheckedVisitors((prev) => {
          const newState = { ...prev };
          if (newState[visit.Visit_Id]) {
            delete newState[visit.Visit_Id].checkedIn;
          }
          return newState;
        });
        getVisitorData(); // Refresh data from server
      }
    } catch (error) {
      alert("Error undoing check-in");
    }
  };

  return (
    <div
      className="bg-white w-screen px-2"
      style={{ backgroundColor: "white" }}
    >
      <form action="" onSubmit={() => alert("submitting")} className="w-full">
        <h1 className="cTitle">Incoming Visitors List.</h1>
        <div className="flex justify-end mb-2 pr-2">
          <span onClick={() => handleRefresh()}>
            <LuRefreshCcw className="text-3xl text-blue-400 cursor-pointer" />
          </span>
        </div>
        <div className="flex justify-end mb-3">
          <div className="w-[25%] flex items-center border rounded-md px-2 py-1 border-black">
            <input
              type="text"
              className="w-full outline-none px-2 py-1"
              placeholder="Search by visitor's name"
              onChange={(e) => handleSearchChanges(e)}
            />
            <span>
              <IoMdSearch
                className="text-4xl hover:text-green-600 text-blue-400 cursor-pointer"
                onClick={() => handleSearchByName()}
              />
            </span>
          </div>
        </div>

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
              {Array.isArray(visitorList) &&
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
                      className="odd:bg-blue-100 even:bg-blue-200 border-b border-white hover:text-black"
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
                        style={{ border: "0", borderLeft: "1px solid white" }}
                      >
                        <div className="flex h-full">
                          <div className="w-1/2 text-center h-full border-r border-black">
                            {new Date(
                              visitor.Visits[0]?.Date_From
                            ).toLocaleDateString()}
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
                      >
                        <div className="w-full justify-around flex">
                          <div className="flex items-center">
                            {visitor.Visits[0].Checkin_Time ? (
                              <p className="bg-green-300 py-1 px-2 rounded-md border border-black">
                                {formatTime(visitor.Visits[0].Checkin_Time)}
                              </p>
                            ) : isCheckedIn ? (
                              <p className="bg-green-300 py-1 px-2 rounded-md border border-black">
                                {formatTime(isCheckedIn)}
                              </p>
                            ) : (
                              <div className="flex items-center">
                                <div className="">
                                  <button
                                    className="bg-blue-300 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                                    onClick={(e) =>
                                      handleCheckIn(e, visitor.Visits[0])
                                    }
                                  >
                                    Check in
                                  </button>
                                </div>
                              </div>
                            )}
                            <div className="text-xl text-red-600 hover:text-blue-500 cursor-pointer">
                              <IoArrowUndo
                                onClick={(e) =>
                                  handleUndoCheckIn(
                                    e,
                                    visitor.Visits[0].Visit_Id
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center">
                            {visitor.Visits[0].Checkout_Time ? (
                              <p className="bg-red-200 py-1 px-2 rounded-md border border-black">
                                {formatTime(visitor.Visits[0].Checkout_Time)}
                              </p>
                            ) : isCheckedOut ? (
                              <p className="bg-red-200 py-1 px-2 rounded-md border border-black">
                                {formatTime(isCheckedOut)}
                              </p>
                            ) : (
                              <button
                                className="bg-blue-300 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                                onClick={(e) =>
                                  handleCheckOut(e, visitor.Visits[0])
                                }
                              >
                                Check out
                              </button>
                            )}

                            <div className="text-xl text-red-600 hover:text-blue-500 cursor-pointer">
                              <IoArrowUndo
                                onClick={(e) =>
                                  handleUndoCheckOut(
                                    e,
                                    visitor.Visits[0].Visit_Id
                                  )
                                }
                              />
                            </div>
                          </div>
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
