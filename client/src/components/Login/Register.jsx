import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import swal from "sweetalert2";
// import Departments from '../../../../server/models/Departments';

const Register = () => {
  const msg = useRef("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNo: "",
    password: "",
    cpassword: "",
    factory: "",
    department: "", //department id
    userCategory: "",
    conditions: "",
  });

  const [csrfToken, setCsrfToken] = useState("");
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState({});
  const validationErrors = {};
  const accConditions = useRef(false);
  let [numOfClicked, setNumOfClicked] = useState(0);
  const [sErrors, setSErrors] = useState({}); // to store errors from backend
  const [factories, setFactories] = useState({});
  const [userCategories, setUserCategories] = useState({}); // *to store usercategories that are coming from db
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // get the csrf token

  const getFactories = async () => {
    // alert("getting factories");
    try {
      // alert(csrfToken);
      // alert("sending factory request");
      const response = await axios.get(
        `${apiUrl}/department/getAll-Factories`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      if (response) {
        setFactories(response.data.data);
      } else {
        alert("response failed");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const getdFactories = () => {
    if (formData.factory) {
      let factoryId = formData.factory;
      // console.log(factoryId);
      // alert("fac; " + factoryId);
      // return;
      const fetchDepartments = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/department/getDep/${factoryId}`
          );
          if (response) {
            // console.log(response);
            setDepartments(response.data);
          }
        } catch (error) {
          console.error(`error while sending request to back-end: ${error}`);
        }
      };
      fetchDepartments();
    } else {
      alert("Please select your factory before selecting department");
    }
  };

  //  *to get all user categories
  const getUserCategories = async () => {
    // alert("getting user categories");
    try {
      const userCategories = await axios.get(
        `${apiUrl}/userCategory/getAllCategories`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (userCategories) {
        setUserCategories(userCategories.data.data);
      }
    } catch (error) {
      console.log("Request sending error: ", error);
    }
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Update the formData state
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clone the validationErrors object to avoid mutation of previous state
    const newValidationErrors = { ...errors }; // Use 'errors' instead of 'validationErrors'

    // Validation logic
    if (name !== "") {
      switch (name) {
        case "userName":
          const nameTest = /^[A-Za-z\s]{3,}$/;
          if (!value.trim()) {
            newValidationErrors.userName = "Username is required";
          } else if (!nameTest.test(value.trim())) {
            newValidationErrors.userName = "User name can have letters only";
          } else {
            delete newValidationErrors.userName; // Clear the error if no issues
          }
          break;

        case "email":
          if (!value.trim()) {
            newValidationErrors.email = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            newValidationErrors.email = "Invalid email";
          } else {
            delete newValidationErrors.email;
          }
          break;

        case "mobileNo":
          if (!value.trim()) {
            newValidationErrors.mobileNo = "Mobile number is required";
          } else {
            const mValidator = /^[0-9]{10}$/;
            if (!mValidator.test(value)) {
              newValidationErrors.mobileNo = "Invalid mobile number";
            } else {
              delete newValidationErrors.mobileNo;
            }
          }
          break;

        case "password":
          if (!value.trim()) {
            newValidationErrors.password = "Password is required";
          } else if (value.trim().length < 6) {
            newValidationErrors.password =
              "Password must be at least 6 characters";
          } else {
            delete newValidationErrors.password;
          }
          break;

        case "cpassword":
          if (!value.trim()) {
            newValidationErrors.cpassword = "Confirm password is required";
          } else if (value !== formData.password) {
            newValidationErrors.cpassword = "Passwords do not match.";
          } else {
            delete newValidationErrors.cpassword;
          }
          break;

        case "department":
          if (!value.trim()) {
            newValidationErrors.department = "Please select your department";
          } else {
            delete newValidationErrors.department;
          }
          break;

        case "userCategory":
          if (!value.trim()) {
            newValidationErrors.userCategory = "Please select user category";
          } else {
            delete newValidationErrors.userCategory;
          }
          break;

        case "factory":
          if (!value.trim()) {
            newValidationErrors.factory = "Please select your factory";
          } else {
            delete newValidationErrors.factory;
          }
          break;

        default:
          break;
      }
    }

    // Update the state with the new errors
    setErrors(newValidationErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // alert("submitting");

    // Validating input fields
    if (!formData.userName.trim()) {
      // alert(formData.userName)
      validationErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      validationErrors.userName = "User name must contain more than 3 letters";
    }
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      validationErrors.email = "Invalid email";
    }
    if (!formData.mobileNo.trim()) {
      validationErrors.mobileNo = "Mobile number is required";
    } else {
      const mValidator = /^[0-9]{10}$/;
      if (!mValidator.test(formData.mobileNo.trim())) {
        validationErrors.mobileNo = "Invalid mobile number";
      }
    }
    if (!formData.password.trim()) {
      validationErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.cpassword.trim()) {
      validationErrors.cpassword = "Confirm password is required";
    } else if (formData.cpassword !== formData.password) {
      validationErrors.cpassword =
        "Confirm passwords do not match with password";
    }
    if (!formData.department.trim()) {
      validationErrors.department = "Please select your department";
    }
    if (!formData.userCategory.trim()) {
      validationErrors.userCategory = "Please select user category";
    } else {
      // alert(formData.userCategory);
    }
    if (!accConditions.current.checked) {
      validationErrors.conditions = "You must accept our terms & conditions";
    }
    // alert("validating data");
    setErrors(validationErrors);

    // Submitting the form data if there are no validation errors
    if (Object.keys(validationErrors).length === 0) {
      // alert("Data submitting 12341")
      try {
        setIsLoading(true);
        const response = await axios.post(`${apiUrl}/user/register`, formData, {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });
        // Successfully registered
        // alert("Registration successful");

        if (response.status === 201) {
          setIsLoading(false);
          // alert("User creation success");
          swal.fire({
            title: "User creation success...",
            text: "",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ok",
          });
          setSErrors({ type: "Success", message: "User creation success" });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        if (error.response && error.response.status === 400) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          let errorMessages = "";
          validationErrors.forEach((err) => {
            errorMessages += `${err.msg}\n`;
          });
          console.log("Error message:- ", errorMessages);
          setSErrors({ type: "serror", message: errorMessages });
          // alert(`Registration failed:\n${errorMessages}`);
        } else {
          // Handle other errors
          console.error("Error during registration:", error);
          setSErrors({ type: "error", message: error.response.data.message });
          console.log("Error found ", error);
          alert("Registration failed", error.message);
        }
      }
    }
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
        // alert("csrf token: " + response.data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();

    // *to get all user categories
    getUserCategories();
  }, []);

  //to get department list from department tbl
  // to get list of department id and names

  return (
    <div className="w-full min-h-screen flex justify-center  overflow-x-hidden">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
        </div>
      )}

      <div className="w-full h-sc flex justify-center items-center md:shadow-custom md:w-3/4 md:my-3 lg:w-3/6 lg:my-3 lg:p-0 ">
        {/* Left Div - Can be used for image or branding */}
        <div className="left-div hidden sm:block sm:w-2/6 sm:min-h-full bg-no-repeat bg-cover bg-top">
          {/* Add any content you want here */}
        </div>

        {/* Right Div - Form */}
        <div className="w-full h-full md:w-4/5 lg:w-3/4 p-6 md:p-8 bg-white md:bg-gradient-to-b from-blue-300 via-gray-400/50 to-blue-300 flex items-center">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="registration">
              <div className="flex justify-center mb-4">
                <FaRegUserCircle className="text-6xl md:text-7xl xl:mb-3" />
              </div>
              <h1 className="text-2xl md:text-3xl text-center mb-6 font-bold text-gray-800">
                Create New Member
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="userName"
                    placeholder="Enter your name"
                    onChange={handleChanges}
                    autoComplete="off"
                  />
                  {errors.userName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.userName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="email"
                    placeholder="Enter your email"
                    onChange={handleChanges}
                    autoComplete="false"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="password"
                    placeholder="Enter your password"
                    onChange={handleChanges}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="cpassword"
                    placeholder="Confirm your password"
                    onChange={handleChanges}
                  />
                  {errors.cpassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.cpassword}
                    </p>
                  )}
                </div>

                {/* Factory */}
                <div>
                  <select
                    name="factory"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onChange={handleChanges}
                    onClick={getFactories}
                  >
                    <option value="">Select Factory</option>
                    {factories.length > 0 &&
                      factories.map((factory) => (
                        <option
                          key={factory.Factory_Id}
                          value={factory.Factory_Id}
                        >
                          {factory.Factory_Name}
                        </option>
                      ))}
                  </select>
                  {errors.factory && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.factory}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <select
                    name="department"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onChange={handleChanges}
                    onClick={getdFactories}
                  >
                    <option value="">Select Department</option>
                    {departments.length > 0 &&
                      departments.map((department) => (
                        <option
                          key={department.Department_Id}
                          value={department.Department_Id}
                        >
                          {department.Department_Name}
                        </option>
                      ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="mobileNo"
                    placeholder="Mobile Number"
                    onChange={handleChanges}
                  />
                  {errors.mobileNo && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.mobileNo}
                    </p>
                  )}
                </div>

                {/* User Category */}
                <div>
                  <select
                    name="userCategory"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onChange={handleChanges}
                  >
                    <option value="">Select a user category</option>
                    {Array.isArray(userCategories) &&
                      userCategories.map((userCategory) => {
                        return (
                          <option
                            key={userCategory.Category_Id}
                            value={userCategory.Category}
                          >
                            {userCategory.Category}
                          </option>
                        );
                      })}
                  </select>
                  {errors.userCategory && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.userCategory}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center xl:mt-3">
                  <input
                    type="checkbox"
                    name="conditions"
                    id="iAccept"
                    className="scale-125 mr-2"
                    ref={accConditions}
                  />
                  <label htmlFor="iAccept" className="text-gray-800">
                    I accept the terms and conditions
                  </label>
                </div>
                {errors.conditions && (
                  <p className="text-red-600 text-sm mt-2">
                    {errors.conditions}
                  </p>
                )}
              </div>

              {/* Server Errors/Success */}
              {sErrors?.message && (
                <p
                  className={`text-center font-bold mb-4 ${
                    sErrors.type === "error" || sErrors.type === "serror"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {sErrors.message}
                </p>
              )}

              {/* Buttons */}
              <div className="grid grid-rows-2 gap-4 grid-cols-1 md:grid-rows-1 md:grid-cols-2 xl:mt-10 md:-space-x-7">
                <div className="flex justify-center">
                  <button
                    className="bg-green-600 w-3/4 rounded-md text-white hover:bg-green-500 py-2"
                    type="submit"
                  >
                    Register
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    className="bg-blue-600 w-3/4 rounded-md text-white hover:bg-blue-500 py-2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(-1);
                    }}
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
