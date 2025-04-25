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
      // alert("Sending request to generate Excel file");

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
    <div className="w-full min-h-full flex justify-center">
      <div className="flex px-2 w-full h-100vh justify-center items-center md:h-2/4"  style={{backgroundColor:"white"}}>
        {isLoading && (
          <div className="text-center w-full h-full">
            <div className="loader-overlay w-full h-full">
              <div className="loader"></div>
              {/* <h1 className="text-center">Loading</h1> */}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="border border-gray-500 shadow-custom1 rounded-md p-5 mt-14 boxShadow md:w-[60%] bg-gradient-to-bl from-blue-100 to-blue-300 h-full flex flex-col justify-center items-center">
        <h1 className="text-md mt-2 mb-8 font-extrabold">Select a date period</h1>
          <table className="">
            <tr className="">
              <td className="p-1">
                {" "}
                <label className="text-font-esm md:text-sm" htmlFor="">From</label>
              </td>

              <td className="p-1">
                <input
                  className="text-font-esm md:text-sm border border-slate-500 bg-white p-1 rounded-md"
                  type="date"
                  name="dateFrom"
                  id="r-f-date"
                  onChange={handleChanges}
                />

                {errors.dateFrom && <p className="errors">{errors.dateFrom}</p>}
              </td>
            </tr>

            <tr>
              <td className="p-1">
                {" "}
                <label className="text-font-esm md:text-sm" htmlFor="">To</label>
              </td>

              <td className="p-1">
                <input
                  className="text-font-esm md:text-sm border border-slate-500 bg-white p-1 rounded-md"
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
              <td colSpan={2} className="text-left">
                <button className="py-1 px-3 bg-green-500 hover:bg-green-600 rounded-md hover:text-white font-bold mt-8">
                  <span className="flex justify-center items-center">
                    <FaDownload className="text-font-esm md:text-sm mr-1" />
                    <p className="text-font-esm md:text-sm">Download</p>
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
