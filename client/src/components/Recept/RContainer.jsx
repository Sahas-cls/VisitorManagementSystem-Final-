import React, { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaRegEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RContainer.css";
import Swal from "sweetalert2";

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
  const apiUrl = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // NOTE DOWNLOAD TEMPLATE
  const handleTemplateDownload = (e) => {
    e.preventDefault();
    const link = document.createElement("a");
    link.href = "/upload-visits.xlsx";
    link.download = "upload-visits.xlsx";
    link.click();
  };

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle navigation
  const navigateTo = (visitorData) => {
    // alert("clicked");
    // Navigate to /editVisitor and pass the clicked visitor's data as state
    navigate("/approve-reception", {
      state: { visitor: visitorData, userData: userData },
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // console.log(file);

    const formData = new FormData();
    formData.append("file", file);
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${apiUrl}/visitor/upload-visitors`,
        formData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        },
      );
      console.log("response: ", response);
      if (response.status === 200) {
        Swal.fire({
          title: "Success",
          text: `Visits import success`,
          icon: "success",
          showCancelButton: false,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          setCsrfToken(response.data.csrfToken);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    getCsrf();

    // Fetch visitor data
    const getVisitorData = async () => {
      // alert(userDepartmentId);
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${apiUrl}/visitor/getVisitors-reception`,
          {
            params: {
              userDepartmentId: userDepartmentId,
              userFactoryId: userFactoryId,
            },
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          },
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
              "Network error. Please check your internet connection.",
            );
          }
          alert(errorMessage);
        } else {
          setErrorMessages("An unexpected error occurred.");
          alert("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getVisitorData();
  }, []);

  return (
    <div
      className="rContainer relative bg-red-900"
      style={{ backgroundColor: "white" }}
    >
      {/* <h1>{userDepartmentId}</h1> */}
      {/* <h1>4654: {userId || 123}</h1> */}
      {isLoading && (
        <div className="absolute inset-0 z-20 backdrop-blur-sm flex justify-center items-center flex-col gap-4">
          <div className="border-4 w-16 h-16 rounded-full animate-spin border-b-0 border-blue-400"></div>
          <p className="text-blue-400">Loading</p>
        </div>
      )}
      <form
        action=""
        onSubmit={() => alert("submitting")}
        className="w-full relative"
      >
        <div className="relative">
          <h1 className="text-md mt-2 mb-2 font-extrabold text-center text-lg relative">
            Visitors List {isLoading}
            {console.log("is loading: ", isLoading)}
          </h1>

          <div className="absolute bottom-0 right-8 flex gap-4">
            <button
              onClick={(e) => handleTemplateDownload(e)}
              className="flex-1 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-sm"
            >
              Template
            </button>
            <button
              className="flex-1 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-sm"
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current.click();
              }}
            >
              Upload
            </button>

            <div className="hidden">
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead className="position-sticky">
              <tr>
                <th className="pt-1 text-left pb-1  border-0 bg-blue-500 text-white text-sm">
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
                <th className="border-0"></th>
              </tr>
            </thead>

            <tbody>
              {visitorList &&
                visitorList.map((visitor) => {
                  const vehicleNumbers = visitor.Vehicles.map(
                    (vehicle) => vehicle.Vehicle_No,
                  ).join(", ");

                  const vehicleType = visitor.Vehicles.map(
                    (vehicle) => vehicle.Vehicle_Type,
                  ).join(", ");

                  return (
                    <tr
                      className="odd:bg-blue-100 even:bg-blue-300 text-sm"
                      key={visitor.ContactPerson_Id}
                    >
                      <td className="p-2 border-r-2 border-white text-sm">
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
                      <td
                        className="p-2 border-r-0 border-black w-auto text-sm"
                        style={{ display: "" }}
                      >
                        <div className="h-full md:flex md:gap-1">
                          <div className="w-1/2 text-center md:pr-1 md:h-full md:border-r border-black mb-0">
                            {new Date(
                              visitor.Visits[0]?.Date_From,
                            ).toLocaleDateString()}{" "}
                          </div>
                          {/* &nbsp;-&nbsp; */}

                          <div className="w-1/2 text-center md:h-full border-black">
                            {visitor.Visits[0]?.Date_To &&
                              new Date(
                                visitor.Visits[0]?.Date_To,
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
                          className="hover:text-red-600 text-lg hover:scale-110 duration-300"
                          style={{ cursor: "pointer", fontSize: "1.4rem" }}
                        />
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

export default RContainer;
