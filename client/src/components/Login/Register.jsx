import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Register.css";
import { FaRegUserCircle } from "react-icons/fa";
import swal from "sweetalert2";
// import Departments from '../../../../server/models/Departments';

const Register = () => {
  const msg = useRef("");

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

  // get the csrf token

  const getFactories = async () => {
    // alert("getting factories");
    try {
      // alert(csrfToken);
      // alert("sending factory request");
      const response = await axios.get(
        "http://localhost:3000/department/getAll-Factories",
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
            `http://localhost:3000/department/getDep/${factoryId}`
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
        "http://localhost:3000/userCategory/getAllCategories",
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
        const response = await axios.post(
          "http://localhost:3000/user/register",
          formData,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
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
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
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
    <div className="w-screen h-screen flex justify-center lg:py-3 overflow-x-hidden">
      {isLoading && (
        <div className="text-center w-full h-full">
          <div className="loader-overlay w-full h-full">
            <div className="loader"></div>
            {/* <h1 className="text-center">Loading</h1> */}
          </div>
        </div>
      )}
      <div className="login-registration">
        <div className="left-div w-2/6" style={{ width: "35%" }}>
          {/* <h1 className="text-3xl font-bold" style={{ marginTop: "-20px" }}>Register a user</h1> */}
        </div>
        <div
          className="right-div md:bg-gradient-to-b from-blue-300 via-gray-400/50 to-blue-300"
          style={{
            background:
              "linear-gradient(to bottom, #93c5fd, rgba(156, 163, 175, 0.5), #93c5fd)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="registration" id="registration">
              <div className="text-center flex justify-center">
                <FaRegUserCircle className="text-[70px] text-center text-8xl" />
              </div>
              <h1 className="text-2xl text-center mb-4 font-bold rHeading">
                Create New Member
              </h1>

              <table className="tblInputs">
                <tr>
                  <td clssName="td">
                    {/* //r1 col1  */}
                    <input
                      type="text"
                      className="input"
                      name="userName"
                      placeholder="Enter your name"
                      onChange={handleChanges}
                      autoComplete="off"
                    />
                    <p className="errors">
                      {errors.userName && errors.userName}
                    </p>
                    {/* <p className="errors">{errors.userName && (
                      <p className="errors">{errors.userName}</p>
                    )}{" "}</p> */}
                  </td>
                  {/* r1 col2 */}
                  <td clssName="td">
                    <input
                      type="text"
                      className="input"
                      name="email"
                      placeholder="Enter your email"
                      onChange={handleChanges}
                      autoComplete="false"
                    />
                    <p className="errors">{errors.email && errors.email}</p>
                    {/* {errors.email && <p className="errors">{errors.email}</p>}{" "} */}
                    {/* <br /> */}
                  </td>
                </tr>

                <tr>
                  {/* r2 col1  */}
                  <td clssName="td">
                    {/* <input type="text" className="input" name='mobileNo' placeholder='Enter your mobile no' onChange={handleChanges} />
                  {errors.mobileNo && <p className='errors'>{errors.mobileNo}</p>} <br /> */}
                    <input
                      type="password"
                      className="input"
                      name="password"
                      placeholder="Enter your password"
                      onChange={handleChanges}
                    />
                    {/* {errors.password && (
                      <p className="errors">{errors.password}</p>
                    )}{" "} */}
                    <p className="errors">
                      {errors.password && errors.password}
                    </p>
                    {/* <br /> */}
                  </td>

                  {/* r2 col2  */}
                  <td clssName="td">
                    <input
                      type="password"
                      className="input"
                      name="cpassword"
                      placeholder="Confirm your password"
                      onChange={handleChanges}
                    />
                    {/* {errors.cpassword && (
                      <p className="errors">{errors.cpassword}</p>
                    )}{" "} */}
                    <p className="errors">
                      {errors.cpassword && errors.cpassword}
                    </p>
                    {/* <br /> */}
                  </td>
                </tr>

                {/* row3 - col1  */}
                <tr>
                  <td className="td">
                    <select
                      name="factory"
                      id="factory"
                      className="input input-select"
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
                    {/* {errors.factory && (
                      <p className="errors">{errors.factory}</p>
                    )}{" "} */}
                    <p className="errors">{errors.factory && errors.factory}</p>
                    {/* <br /> */}
                  </td>

                  <td className="td">
                    <select
                      name="department"
                      id="department"
                      className="input input-select"
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
                    {/* {errors.department && (
                      <p className="errors">{errors.department}</p>
                    )}{" "} */}
                    <p className="errors">
                      {errors.department && errors.department}
                    </p>
                    {/* <br /> */}
                  </td>

                  {/* row3 - col2  */}
                  {/* add department */}
                </tr>

                {/* =========================== */}

                <tr>
                  {/* row4 - col2  */}
                  <td clssName="td">
                    <input
                      type="text"
                      className="input"
                      name="mobileNo"
                      placeholder="Mobile Number"
                      onChange={handleChanges}
                    />
                    {/* {errors.mobileNo && (
                      <p className="errors">{errors.mobileNo}</p>
                    )}{" "} */}
                    <p className="errors">
                      {errors.mobileNo && errors.mobileNo}
                    </p>
                    {/* <br /> */}
                  </td>

                  <td clssName="td">
                    <select
                      name="userCategory"
                      id="userCategory"
                      className="input input-select"
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
                    {/* {errors.userCategory && (
                      <p className="errors">{errors.userCategory}</p>
                    )}{" "} */}
                    <p className="errors">
                      {errors.userCategory && errors.userCategory}
                    </p>
                    {/* <br /> */}
                  </td>
                </tr>
              </table>

              {/* <input type="text" className="input" name='userName' placeholder='Enter your name' onChange={handleChanges} />
              // {errors.userName && <p className='errors'>{errors.userName}</p>} <br /> */}

              <p className="text-center text-white mb-4">
                <input
                  type="checkbox"
                  name="conditions"
                  id="iAccept"
                  className="scale-125"
                  ref={accConditions}
                />{" "}
                <label htmlFor="iAccept" className="text-black">
                  I accept the terms and conditions
                </label>
                {errors.conditions && (
                  <p
                    className="errors text-red-600"
                    style={{ marginTop: "5px" }}
                  >
                    {errors.conditions}
                  </p>
                )}{" "}
                <br />
              </p>
              <p
                className={`text-center text-red-600 font-bold ${
                  sErrors?.type === "error" || sErrors?.type === "serror"
                    ? "error"
                    : "success"
                }`}
              >
                {sErrors?.type === "serror" && sErrors.message}
                {sErrors?.type === "error" && sErrors.message}
                {sErrors?.type === "Success" && sErrors.message}
              </p>
              <div className="text-center mb-4">
                {/* <a href="/">
                  <p className="mb-4 text-blue-900 font-bold hover:text-red-600">
                    Already have an account? Login
                  </p>
                </a> */}
                <button className="rButton1 hover:scale-105 duration-300 hover:tracking-wider" type="submit">
                  Register
                </button>

                <button
                  type="button"
                  className="rButton2 mt-4 hover:scale-105 duration-300 hover:tracking-wider"
                  onClick={() =>
                    (window.location.href = "http://localhost:5173/")
                  }
                >
                  Go to Login
                </button>
              </div>
              <p className="msg"></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
