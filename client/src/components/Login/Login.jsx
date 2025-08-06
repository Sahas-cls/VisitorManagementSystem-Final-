import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { FaUser, FaVoicemail } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import axios from "axios";
import { FaRegUserCircle } from "react-icons/fa";
import { GrCopy } from "react-icons/gr";
import swal from "sweetalert2";
import sidebarImg from "../../assets/sidebarImg6.jpg";

const Login = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [Serrors, setSErrors] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;
  // alert(apiUrl);
  const navigate = useNavigate();

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          // console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        // alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();
  }, []);

  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  //use state for set errors
  const [errors, seterrors] = useState({});
  //constant to store errors temporary
  const error = {};

  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Copy the existing errors to maintain previous error messages
    let newErrors = { ...errors };

    switch (name) {
      case "email":
        if (!value) {
          newErrors.email = "Please enter your email";
        } else {
          const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailValidator.test(value)) {
            newErrors.email = "Invalid email";
          } else {
            delete newErrors.email; // Remove the error if it's valid
          }
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password cannot be empty";
        } else {
          if (value.trim().length < 6) {
            newErrors.password = "Password is too short";
          } else {
            delete newErrors.password; // Remove the error if it's valid
          }
        }
        break;

      default:
        break;
    }

    // Update the error state with the modified errors
    seterrors(newErrors);

    // Update form data state
    setformData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);

    //validating email
    if (!formData.email) {
      error.email = "Please enter your email";
    } else {
      const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailValidator.test(formData.email)) {
        error.email = "Invalid email";
      }
    }

    if (!formData.password) {
      error.password = "Password cannot be empty";
    } else {
      if (formData.password.trim().length < 6) {
        error.password = "Password too short";
      }
    }
    seterrors(error);

    if (Object.keys(error).length === 0) {
      try {
        // alert("sending data");
        const response = await axios.post(`${apiUrl}/user/login`, formData, {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });
        // alert("Hello");
        if (response.status === 200) {
          // alert("Login success");
          // console.log(response);
          // alert("login success");
          await swal.fire({
            title: "User login success",
            text: "",
            icon: "success", // You can use 'question', 'warning', 'info', etc.
            showCancelButton: false,
            confirmButtonText: "Ok",
            cancelButtonText: "No, cancel!",
            confirmButtonColor: "#d33", // Custom confirm button color (red in this case)
            cancelButtonColor: "#3085d6", // Custom cancel button color (blue)
          });
          setSErrors({ type: "success", text: response.data.msg });
          // alert("login success");
          // await delay(3000);
          // alert(response.data.msg);
          // console.log(response.data);
          const userCategory = response.data.data.userCategory || "unknown";
          // console.log(userCategory);
          // alert(userCategory);
          // alert(`response data: ${userCategory}`);

          switch (userCategory) {
            case "Department Head":
              navigate("/dashboard-d-head");
              break;
            case "Department User":
              // alert("duser");
              navigate("/dashboard-clerk");
              break;
            case "Reception":
              navigate("/dashboard-recept");
              break;
            case "HR User":
              navigate("/dashboard-hr");
              break;
            case "Security Officer":
              navigate("/dashboard-security-officer");
              break;
            case "Admin":
              navigate("/dashboard-administrator");
              break;
            default:
              // navigate("/unauthorized-access");
              break;
          }
        } else {
          // alert(response.data.msg);
          throw Error(response.data.msg);
          alert("Login failed");
        }

        // alert(response.data);
        // console.log(response.data);
      } catch (error) {
        // alert(error);
        const errorMessage =
          error.response && error.response.data && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        setSErrors({ type: "error", text: errorMessage });
        // setSErrors({ type: "error", text: error });
      }
    }
  };

  //function for copy a text to clipboard
  const copyToClipboard = (txtCopy) => {
    // const textToCopy = "Your text to be copied";

    navigator.clipboard
      .writeText(txtCopy)
      .then(() => {
        alert("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="w-screen max-h-screen p-4 min-h-screen flex justify-center">
      <div className="w-full h-container border rounded-lg shadow-xl md:border-0 flex justify-center md:shadow-custom md:w-3/4 md:my-3 lg:w-3/6 lg:my-3 lg:p-0">
        {/* Left div remains unchanged - only visible on sm+ */}
        <div className="left-div hidden sm:block sm:w-2/6 sm:min-h-full bg-no-repeat bg-cover bg-center">
          {/* Keep your image/welcome content here */}
        </div>

        {/* Right div - mobile optimizations */}
        <div className="right-div w-full flex flex-col items-center sm:w-3/4 lg:w-3/4 md:bg-blue-900/20">
          {/* Mobile-optimized header */}
          <div className="sm:hidden w-full bg-blue-600 text-white p-4 rounded-t-lg text-center">
            <h1 className="text-xl font-bold">Member Login</h1>
          </div>

          <div className="p-4 w-full">
            <FaRegUserCircle className="text-5xl md:text-7xl lg:text-8xl mx-auto mt-2 text-blue-600 -mb-2 md:2 lg:mb-6" />

            {Serrors.text && (
              <div
                className={`w-full p-2 mb-4 rounded text-center ${
                  Serrors.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {Serrors.text}
              </div>
            )}

            <form
              className="flex flex-col w-full items-center"
              onSubmit={handleSubmit}
            >
              {/* Email Field */}
              <div className="w-full mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="bg-white border border-gray-300 flex items-center w-full p-2 rounded-md">
                  <input
                    className="w-full h-full outline-none bg-transparent py-1 active:bg-white"
                    type="text"
                    name="email"
                    placeholder="Enter your email"
                    onChange={handleChanges}
                    autoComplete="off"
                  />
                  <MdEmail className="text-gray-500 text-xl" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="w-full mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="bg-white border border-gray-300 flex items-center w-full p-2 rounded-md">
                  <input
                    className="w-full h-full outline-none bg-transparent py-1"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChanges}
                    autoComplete="off"
                  />
                  <RiLockPasswordFill className="text-gray-500 text-xl" />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="w-full text-right mb-4">
                <a
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Buttons */}
              <div className="w-full space-y-3">
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                  type="submit"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                >
                  Create an Account
                </button>
              </div>

              {/* Visitor Link Section */}
              <div className="w-full mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Share this link with visitors:
                </p>
                <div className="flex items-center justify-center bg-gray-100 md:bg-gray-100/40 p-2 rounded">
                  <a
                    className="text-blue-600 text-sm truncate"
                    href="/new-visitor"
                  >
                    {`${import.meta.env.VITE_FRONTEND_URL}/new-visitor`}
                  </a>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${import.meta.env.VITE_FRONTEND_URL}/new-visitor`
                      )
                    }
                    className="ml-2 text-gray-600 hover:text-blue-600"
                  >
                    <GrCopy />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
