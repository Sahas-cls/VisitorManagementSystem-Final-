import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { MdLockReset } from "react-icons/md";
import resetPasswordImg from "../../../public/reset-password.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [emailErrors, setEmailErrors] = useState();
  const [serverSideMsg, setServerSideMsg] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        alert(`Error fetching CSRF token: ${error}`);
      }
    };
    getCsrf();
  }, []);

  const handleEmailChange = (e) => {
    const userEmail = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmail(userEmail);
    setEmailErrors(emailRegex.test(userEmail) ? "" : "Invalid email format");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailErrors && email) {
      try {
        const response = await axios.post(
          `${apiUrl}/user/forgot-password`,
          { email },
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setServerSideMsg({
            success:
              "We've sent you an email with instructions to reset your password. Please check your inbox.",
          });
        }
      } catch (error) {
        const message =
          error?.response?.status === 400
            ? error.response.data.msg
            : "Something went wrong. Please try again.";
        Swal.fire({
          title: "Error",
          text: message,
          icon: "warning",
        });
        setServerSideMsg({ error: message });
      }
    } else {
      setEmailErrors("Please enter a valid email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Reset Your Password
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your registered email address
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <img src={resetPasswordImg} alt="Reset" className="w-28 h-28" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className={`w-full p-3 border ${
                emailErrors ? "border-red-400" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {emailErrors && (
              <p className="text-red-500 text-sm mt-1">{emailErrors}</p>
            )}
          </div>

          {serverSideMsg.success && (
            <p className="text-green-600 text-sm text-center font-medium">
              {serverSideMsg.success}
            </p>
          )}

          {serverSideMsg.error && (
            <p className="text-red-600 text-sm text-center font-medium">
              {serverSideMsg.error}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              <div className="flex items-center justify-center gap-2">
                <MdLockReset />
                <span>Send Reset Link</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-gray-400 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
