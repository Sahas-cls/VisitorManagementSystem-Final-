import React, { useEffect, useState } from "react";
import "./RContainer.css";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import "./RDashboard.css";

const RDashboard = () => {
  const [formData, setFormData] = useState({
    dateFrom: "",
    dateTo: "",
  });
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dateFrom !== "" && formData.dateTo !== "") {
      alert("Sending request to generate Excel file");

      try {
        // Step 1: Make the request to generate the Excel file
        setIsLoading(true);
        const response = await axios.post(
          "http://localhost:3000/visitor/generateExcelRepo",
          formData,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true, // Ensure withCredentials is set correctly
            responseType: "blob", // Expect the response as a file (Excel)
          }
        );

        // Step 2: Create a Blob from the response data
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Step 3: Create an anchor element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "generated-report.xlsx"); // You can customize the filename here
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error generating or downloading the Excel file:", error);
      }
    } else {
      alert(
        "Please provide both 'dateFrom' and 'dateTo' to generate the report."
      );
    }
  };

  const handleChanges = (e) => {
    let err = {};
    const { name, value } = e.target;
    const today = new Date().toISOString().split("T")[0];
    // alert(value)
    // if (name === "dateFrom") {
    //   if (value != "") {
    //     if (value < today) {
    //       err = { ...err, dateFrom: "Date cannot be in past" };
    //       setErrors(err);
    //     } else {
    //       delete err.dateFrom;
    //       setErrors(err);
    //     }
    //   }
    // }

    // if (name === "dateTo") {
    //   alert(formData.dateFrom);
    //   if (value != "") {
    //     if (value < (formData.dateFrom != "" ? formData.dateFrom : today)) {
    //       err = { ...err, dateTo: "Date cannot be in past" };
    //       setErrors(err);
    //     } else {
    //       delete err.dateTo;
    //       setErrors(err);
    //     }
    //   }
    // }

    setFormData({
      ...formData,
      [name]: value,
    });

    // setErrors(err);
  };

  return (
    <div className="w-full min-h-full">
      <div className="cContainer flex">
        {isLoading && (
          <div className="text-center w-full h-full">
            <div className="loader-overlay w-full h-full">
              <div className="loader"></div>
              {/* <h1 className="text-center">Loading</h1> */}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="border-2 border-gray-500 shadow-xl rounded-md px-16 py-10 mt-14 boxShadow">
        <h1>Select a date period</h1>
          <table className="">
            <tr>
              <td className="p-3">
                {" "}
                <label htmlFor="r-f-date">From</label>
              </td>

              <td className="p-3">
                <input
                  className="recInput w-full mb-3"
                  type="date"
                  name="dateFrom"
                  id="r-f-date"
                  onChange={handleChanges}
                />

                {errors.dateFrom && <p className="errors">{errors.dateFrom}</p>}
              </td>
            </tr>

            <tr>
              <td className="p-3">
                {" "}
                <label htmlFor="r-t-date">To</label>
              </td>

              <td className="p-3">
                <input
                  className="recInput w-full mb-3"
                  type="date"
                  name="dateTo"
                  id="r-t-date"
                  onChange={handleChanges}
                />
                {errors.dateTo && <p className="errors">{errors.dateTo}</p>}
              </td>
            </tr>

            <tr>
              {/* <td></td> */}
              <td colSpan={2} className="text-right p-3">
                <button className="py-1 px-3 bg-green-500 hover:bg-green-600 rounded-md hover:text-white font-bold mt-3">
                  <span className="flex">
                    <FaDownload className="text-lg mr-1" />
                    <h3>Download</h3>
                  </span>
                </button>
              </td>
            </tr>
          </table>
        </form>
      </div>
    </div>
  );
};

export default RDashboard;
