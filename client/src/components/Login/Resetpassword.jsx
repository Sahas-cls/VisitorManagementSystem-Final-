import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Resetpassword = () => {
  const [formData, setFormData] = useState();
  const [csrfToken, setCsrfToken] = useState();
  const [serverSideErrors, setServerSideErrors] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          const csrf = await response.data.csrfToken;
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
    console.log("=================================");
    console.log(formData);
    try {
      // alert("sending post request");
      const response = await axios.post(
        `${apiUrl}/user/reset-password`,
        formData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("response- ", response);

      if (response.status === 200) {
        setServerSideErrors("");
        setSuccessMessage({ success: "Your password reset success" });
      }
    } catch (error) {
      setSuccessMessage("");
      // alert("error occured");
      // alert(error.response.status);
      if (error.response.status === 400) {
        setServerSideErrors(
          error.response.data.errors || error.response.data.error
        );
      } else if (error.response.status === 404) {
        setServerSideErrors(error.response.data.errors);
      }
      console.log(error);
    }
  };

  const navigate = useNavigate();

  const goBack = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-1 sm:p-6  bg-[#d7dadf] sm:bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto ">
        <div className=" bg-[#d7dadf]  p-6 sm:p-8 rounded-xl sm:shadow-lg sm:border sm:border-black/30 w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Reset Your Password
          </h1>

          {/* Token Field */}
          <div className="mb-6">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="token"
                className="text-sm font-medium text-gray-700"
              >
                Token
              </label>
              <input
                type="text"
                name="token"
                id="token"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onChange={handleChanges}
                placeholder="Enter your token"
              />
              {Array.isArray(serverSideErrors) &&
                serverSideErrors.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {serverSideErrors
                      .filter((error) => error.path === "token")
                      .map((error, index) => (
                        <p key={index}>{error.msg}</p>
                      ))}
                  </div>
                )}
            </div>
          </div>

          {/* New Password Field */}
          <div className="mb-6">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onChange={handleChanges}
                placeholder="Enter new password"
              />
              {Array.isArray(serverSideErrors) &&
                serverSideErrors.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {serverSideErrors
                      .filter((error) => error.path === "password")
                      .map((error, index) => (
                        <p key={index}>{error.msg}</p>
                      ))}
                  </div>
                )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="cpassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="cpassword"
                name="cpassword"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onChange={handleChanges}
                placeholder="Confirm your password"
              />
              {Array.isArray(serverSideErrors) &&
                serverSideErrors.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {serverSideErrors
                      .filter((error) => error.path === "cpassword")
                      .map((error, index) => (
                        <p key={index}>{error.msg}</p>
                      ))}
                  </div>
                )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage?.success && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-center">
              {successMessage.success}
            </div>
          )}

          {/* Server Side Errors */}
          {!Array.isArray(serverSideErrors) && serverSideErrors && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-center">
              {serverSideErrors}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium"
            >
              Reset Password
            </button>

            <button
              type="button"
              onClick={goBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Resetpassword;
