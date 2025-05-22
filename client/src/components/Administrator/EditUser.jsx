import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./EditUser.css";
import { FaRegUserCircle } from "react-icons/fa";
import swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

const EditUser = () => {
  const msg = useRef("");
  const location = useLocation();
  const navigate = useNavigate();
  const visitors = location.state.visitors;
  console.log("edit users visitos: ", visitors);

  const {
    user_Id,
    user_Name,
    user_category,
    user_email,
    Department_Id,
    department_Id,
    factory_Id,
    mobile_No,
  } = visitors;

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
  const [showPW, setShowPW] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    userId: user_Id,
    userName: user_Name,
    email: user_email,
    mobileNo: mobile_No,
    password: "",
    cpassword: "",
    factory: factory_Id,
    department: department_Id, //department id
    userCategory: user_category,
    resetPassword: showPW,
  });

  // get the csrf token

  const getFactories = async () => {
    try {
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
      const fetchDepartments = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/department/getDep/${factoryId}`
          );
          if (response) {
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

    // Validation logic
    if (name !== "") {
      switch (name) {
        case "userName":
          if (!value.trim()) {
            validationErrors.userName = "Username is required";
          } else if (value.trim().length <= 3) {
            validationErrors.userName =
              "User name must contain more than 3 letters";
          } else {
            delete validationErrors.userName; // Clear the error if no issues
          }
          setErrors(validationErrors);
          break;

        case "email":
          if (!value.trim()) {
            validationErrors.email = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            validationErrors.email = "Invalid email";
          } else {
            delete validationErrors.email;
          }
          setErrors(validationErrors);
          break;

        case "mobileNo":
          if (!value.trim()) {
            validationErrors.mobileNo = "Mobile number is required";
          } else {
            const mValidator = /^[0-9]{10}$/;
            if (!mValidator.test(value)) {
              validationErrors.mobileNo = "Invalid mobile number";
            } else {
              delete validationErrors.mobileNo;
            }
          }
          setErrors(validationErrors);
          break;

        case "password":
          if (showPW) {
            if (!value.trim()) {
              validationErrors.password = "Password is required";
            } else if (value.trim().length < 6) {
              validationErrors.password =
                "Password must be at least 6 characters";
            } else {
              delete validationErrors.password;
            }
            setErrors(validationErrors);
            break;
          }

        case "cpassword":
          if (showPW) {
            if (!value.trim()) {
              validationErrors.cpassword = "Confirm password is required";
            } else if (value !== formData.password) {
              validationErrors.cpassword = "Passwords do not match.";
            } else {
              delete validationErrors.cpassword;
            }
            setErrors(validationErrors);
            break;
          }

        case "department":
          if (!value.trim()) {
            validationErrors.department = "Please select your department";
          } else {
            delete validationErrors.department;
          }
          setErrors(validationErrors);
          break;

        case "userCategory":
          if (!value.trim()) {
            validationErrors.userCategory = "Please select user category";
          } else {
            delete validationErrors.userCategory;
          }
          setErrors(validationErrors);
          break;

        case "factory":
          if (!value.trim()) {
            validationErrors.factory = "Please select your factory";
          } else {
            delete validationErrors.factory;
          }
          setErrors(validationErrors);
          break;

        default:
          break;
      }
    }
  };

  // Edit user function
  const handleEdit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.userName.trim()) {
      validationErrors.userName = "Username is required";
    }
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    }
    if (!formData.mobileNo.trim()) {
      validationErrors.mobileNo = "Mobile number is required";
    }
    if (!formData.department) {
      validationErrors.department = "Please select your department";
    }
    if (!formData.userCategory.trim()) {
      validationErrors.userCategory = "Please select user category";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const response = await axios.put(
          `${apiUrl}/user/update/${formData.userId}`,
          formData,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsLoading(false);
          swal.fire({
            title: "User updated successfully!",
            text: "",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ok",
          });
          setSErrors({ type: "Success", message: "User updated successfully" });
          // Optionally navigate back or refresh data
          // navigate(-1); // Go back to previous page
        }
      } catch (error) {
        setIsLoading(false);
        if (error.response && error.response.status === 400) {
          const validationErrors = error.response.data.errors;
          let errorMessages = "";
          validationErrors.forEach((err) => {
            errorMessages += `${err.msg}\n`;
          });
          setSErrors({ type: "serror", message: errorMessages });
        } else {
          console.error("Error during update:", error);
          setSErrors({
            type: "error",
            message: error.response?.data?.message || "Update failed",
          });
        }
      }
    }
  };

  // Delete user function
  const handleDelete = async () => {
    try {
      const result = await swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await axios.delete(
          `${apiUrl}/user/delete/${formData.userId}`,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsLoading(false);
          swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
          });
          // Navigate back or to another page after deletion
          navigate(-1); // Go back to previous page
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error during deletion:", error);
      swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Deletion failed",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken();
    getFactories();
    getUserCategories();
  }, []);

  const handleResetPassword = (e) => {
    // alert(e.target.checked);
    setShowPW(e.target.checked);
  };

  return (
    <div className="w-full flex justify-center items-center h-screen">
      {isLoading && (
        <div className="text-center w-full h-full">
          <div className="loader-overlay w-full h-full">
            <div className="loader"></div>
          </div>
        </div>
      )}
      <div className="login-registration">
        <div className="right-div">
          <form onSubmit={handleEdit}>
            <div className="registration" id="registration">
              <div className="text-center flex justify-center">
                <FaRegUserCircle className="text-[70px] text-center rgIcon" />
              </div>
              <h1 className="text-2xl text-center mb-4 font-bold rHeading">
                Edit Member
              </h1>

              <table className="tblInputs">
                <tr>
                  <td clssName="td">
                    <input
                      type="text"
                      className="input"
                      name="userName"
                      placeholder="Enter your name"
                      onChange={handleChanges}
                      autoComplete="off"
                      value={formData.userName}
                    />
                    <p className="errors">
                      {errors.userName && errors.userName}
                    </p>
                  </td>
                  <td clssName="td">
                    <input
                      type="text"
                      className="input"
                      name="email"
                      placeholder="Enter your email"
                      onChange={handleChanges}
                      autoComplete="false"
                      value={formData.email}
                    />
                    <p className="errors">{errors.email && errors.email}</p>
                  </td>
                </tr>

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
                            selected={factory.Factory_Id === formData.factory}
                          >
                            {factory.Factory_Name}
                          </option>
                        ))}
                    </select>
                    <p className="errors">{errors.factory && errors.factory}</p>
                  </td>

                  <td className="td">
                    <select
                      name="department"
                      id="department"
                      className="input input-select"
                      onChange={handleChanges}
                      onClick={getdFactories}
                    >
                      <option value="">Select department</option>
                      {departments.length > 0 &&
                        departments.map((department) => (
                          <option
                            key={department.Department_Id}
                            value={department.Department_Id}
                            selected={
                              department.Department_Id === formData.department
                            }
                          >
                            {department.Department_Name}
                          </option>
                        ))}
                    </select>
                    <p className="errors">
                      {errors.department && errors.department}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td clssName="td">
                    <input
                      type="text"
                      className="input"
                      name="mobileNo"
                      placeholder="Mobile Number"
                      onChange={handleChanges}
                      value={formData.mobileNo}
                    />
                    <p className="errors">
                      {errors.mobileNo && errors.mobileNo}
                    </p>
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
                              value={userCategory.Category}
                              selected={
                                userCategory.Category === formData.userCategory
                              }
                            >
                              {userCategory.Category}
                            </option>
                          );
                        })}
                    </select>
                    <p className="errors">
                      {errors.userCategory && errors.userCategory}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="">
                    <p className="text-left mb-2">
                      <input
                        type="checkbox"
                        name=""
                        id="showPW"
                        onChange={(e) => handleResetPassword(e)}
                      />{" "}
                      <label htmlFor="showPW">Set Password</label>
                    </p>
                  </td>
                </tr>

                {showPW && (
                  <tr>
                    <td clssName="td">
                      <input
                        type="password"
                        className="input"
                        name="password"
                        placeholder="Enter new password (optional)"
                        onChange={handleChanges}
                      />
                      <p className="errors">
                        {errors.password && errors.password}
                      </p>
                    </td>

                    <td clssName="td">
                      <input
                        type="password"
                        className="input"
                        name="cpassword"
                        placeholder="Confirm new password"
                        onChange={handleChanges}
                      />
                      <p className="errors">
                        {errors.cpassword && errors.cpassword}
                      </p>
                    </td>
                  </tr>
                )}
              </table>

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
                <button className="rButton1" type="submit">
                  Update
                </button>

                {/* <button
                  type="button"
                  className="rButton2 mt-4"
                  onClick={handleDelete}
                  style={{ backgroundColor: "#dc3545" }}
                >
                  Delete
                </button> */}

                <button
                  type="button"
                  className="rButton2 mt-4"
                  onClick={() => navigate(-1)}
                >
                  Cancel
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

export default EditUser;
