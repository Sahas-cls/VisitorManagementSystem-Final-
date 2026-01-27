import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./EditUser.css";
import { FaRegUserCircle, FaArrowLeft } from "react-icons/fa";
import swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

const EditUser = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle both naming conventions: 'visitors' (old) and 'user' (new)
  const userData = location.state?.user || location.state?.visitors;

  // console.log("Edit user data: ", userData);

  if (!userData) {
    navigate("/manage-users");
    return null;
  }

  const {
    user_Id,
    user_Name,
    user_category,
    user_email,
    Department_Id,
    department_Id,
    factory_Id,
    mobile_No,
    Department, // Added for better department handling
  } = userData;

  const [csrfToken, setCsrfToken] = useState("");
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [factories, setFactories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [sErrors, setSErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPW, setShowPW] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Use department_Id if available, otherwise Department_Id, otherwise Department?.Department_Id
  const initialDepartment =
    department_Id || Department_Id || Department?.Department_Id || "";

  const [formData, setFormData] = useState({
    userId: user_Id,
    userName: user_Name || "",
    email: user_email || "",
    mobileNo: mobile_No || "",
    password: "",
    cpassword: "",
    factory: factory_Id || "",
    department: initialDepartment,
    userCategory: user_category || "",
    resetPassword: false,
  });

  // Update formData when showPW changes
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      resetPassword: showPW,
    }));
  }, [showPW]);

  // Fetch CSRF token and initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch CSRF token
        const csrfResponse = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (csrfResponse.status === 200) {
          setCsrfToken(csrfResponse.data.csrfToken);
        }

        // Fetch factories
        const factoriesResponse = await axios.get(
          `${apiUrl}/department/getAll-Factories`,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        if (factoriesResponse.data?.data) {
          setFactories(factoriesResponse.data.data);
        }

        // Fetch user categories
        const categoriesResponse = await axios.get(
          `${apiUrl}/userCategory/getAllCategories`,
          {
            headers: { "X-CSRF-Token": csrfToken },
            withCredentials: true,
          }
        );
        if (categoriesResponse.data?.data) {
          setUserCategories(categoriesResponse.data.data);
        }

        // Fetch departments if factory is already selected
        if (formData.factory) {
          const departmentsResponse = await axios.get(
            `${apiUrl}/department/getDep/${formData.factory}`
          );
          if (departmentsResponse.data) {
            setDepartments(departmentsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        swal.fire({
          title: "Error",
          text: "Failed to load data. Please refresh the page.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };

    initializeData();
  }, []);

  // Fetch departments when factory changes
  const fetchDepartments = async (factoryId) => {
    if (!factoryId) {
      setDepartments([]);
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/department/getDep/${factoryId}`
      );
      if (response.data) {
        setDepartments(response.data);

        // If current department is not in the new factory's departments, reset it
        const departmentExists = response.data.some(
          (dept) => dept.Department_Id === formData.department
        );
        if (!departmentExists) {
          setFormData((prev) => ({ ...prev, department: "" }));
        }
      }
    } catch (error) {
      console.error(`Error fetching departments: ${error}`);
      setDepartments([]);
    }
  };

  // Handle input changes with validation
  const handleChanges = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // Clear any previous errors for this field
    const updatedErrors = { ...errors };
    delete updatedErrors[name];
    delete updatedErrors.submit;

    // Field-specific validation
    switch (name) {
      case "userName":
        if (!value.trim()) {
          updatedErrors.userName = "Username is required";
        } else if (value.trim().length <= 3) {
          updatedErrors.userName = "User name must contain more than 3 letters";
        }
        break;

      case "email":
        if (!value.trim()) {
          updatedErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          updatedErrors.email = "Invalid email format";
        }
        break;

      case "mobileNo":
        if (!value.trim()) {
          updatedErrors.mobileNo = "Mobile number is required";
        } else if (!/^[0-9]{10}$/.test(value)) {
          updatedErrors.mobileNo = "Invalid mobile number (10 digits required)";
        }
        break;

      case "factory":
        if (value) {
          fetchDepartments(value);
        } else {
          setDepartments([]);
          updatedFormData.department = "";
        }
        if (!value.trim()) {
          updatedErrors.factory = "Please select a factory";
        }
        break;

      case "department":
        if (!value.trim()) {
          updatedErrors.department = "Please select a department";
        }
        break;

      case "userCategory":
        if (!value.trim()) {
          updatedErrors.userCategory = "Please select user category";
        }
        break;

      case "password":
        if (showPW) {
          if (!value.trim()) {
            updatedErrors.password = "Password is required";
          } else if (value.trim().length < 6) {
            updatedErrors.password = "Password must be at least 6 characters";
          }
        }
        break;

      case "cpassword":
        if (showPW) {
          if (!value.trim()) {
            updatedErrors.cpassword = "Confirm password is required";
          } else if (value !== formData.password) {
            updatedErrors.cpassword = "Passwords do not match";
          }
        }
        break;

      default:
        break;
    }

    setErrors(updatedErrors);
    setFormData(updatedFormData);
    setSErrors(""); // Clear any previous submission errors
  };

  // Form validation
  const validateForm = () => {
    const validationErrors = {};

    if (!formData.userName.trim()) {
      validationErrors.userName = "Username is required";
    } else if (formData.userName.trim().length <= 3) {
      validationErrors.userName = "User name must contain more than 3 letters";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }

    if (!formData.mobileNo.trim()) {
      validationErrors.mobileNo = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
      validationErrors.mobileNo = "Invalid mobile number (10 digits required)";
    }

    if (!formData.factory) {
      validationErrors.factory = "Please select a factory";
    }

    if (!formData.department) {
      validationErrors.department = "Please select a department";
    }

    if (!formData.userCategory) {
      validationErrors.userCategory = "Please select user category";
    }

    if (showPW) {
      if (!formData.password.trim()) {
        validationErrors.password = "Password is required when resetting";
      } else if (formData.password.trim().length < 6) {
        validationErrors.password = "Password must be at least 6 characters";
      }

      if (!formData.cpassword.trim()) {
        validationErrors.cpassword = "Confirm password is required";
      } else if (formData.cpassword !== formData.password) {
        validationErrors.cpassword = "Passwords do not match";
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Edit user function
  const handleEdit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      setSErrors("Please fix the errors in the form.");
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setSErrors("");

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Only include password fields if resetting password
        ...(showPW
          ? {
              password: formData.password,
              cpassword: formData.cpassword,
              resetPassword: true,
            }
          : {
              password: "",
              cpassword: "",
              resetPassword: false,
            }),
      };

      console.log("Submitting data:", submitData);

      const response = await axios.put(
        `${apiUrl}/user/update/${formData.userId}`,
        submitData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        swal
          .fire({
            title: "Success!",
            text: "User updated successfully",
            icon: "success",
            confirmButtonText: "OK",
            timer: 2000,
            timerProgressBar: true,
          })
          .then(() => {
            navigate(-1);
          });
      }
    } catch (error) {
      console.error("Error during update:", error);

      let errorMessage = "Update failed. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data?.errors) {
              const validationErrors = error.response.data.errors;
              errorMessage = validationErrors.map((err) => err.msg).join("\n");
            } else {
              errorMessage =
                error.response.data?.message || "Invalid data provided";
            }
            break;
          case 401:
            errorMessage = "Your session has expired. Please login again.";
            setTimeout(() => navigate("/login"), 2000);
            break;
          case 403:
            errorMessage = "You don't have permission to update users.";
            break;
          case 404:
            errorMessage = "User not found. It may have been deleted.";
            setTimeout(() => navigate("/manage-users"), 2000);
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || "Update failed";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setSErrors(errorMessage);
      swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // Handle reset password checkbox
  const handleResetPassword = (e) => {
    const isChecked = e.target.checked;
    setShowPW(isChecked);

    // Clear password fields when unchecking
    if (!isChecked) {
      setFormData((prev) => ({
        ...prev,
        password: "",
        cpassword: "",
      }));
      const updatedErrors = { ...errors };
      delete updatedErrors.password;
      delete updatedErrors.cpassword;
      setErrors(updatedErrors);
    }
  };

  // Loading overlay
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-700">Updating user...</p>
      </div>
    </div>
  );

  // Back button handler
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-50 p-4">
      {isLoading && <LoadingOverlay />}

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="Go back"
              >
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Edit User</h1>
                <p className="text-blue-100">Update user information</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm">User ID: {formData.userId}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleEdit}>
            {/* Error message */}
            {sErrors && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{sErrors}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  }`}
                  name="userName"
                  value={formData.userName}
                  onChange={handleChanges}
                  placeholder="Enter username"
                />
                {errors.userName && (
                  <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  name="email"
                  value={formData.email}
                  onChange={handleChanges}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.mobileNo ? "border-red-500" : "border-gray-300"
                  }`}
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChanges}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                {errors.mobileNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobileNo}</p>
                )}
              </div>

              {/* Factory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factory *
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.factory ? "border-red-500" : "border-gray-300"
                  }`}
                  name="factory"
                  value={formData.factory}
                  onChange={handleChanges}
                >
                  <option value="">Select Factory</option>
                  {factories.map((factory) => (
                    <option key={factory.Factory_Id} value={factory.Factory_Id}>
                      {factory.Factory_Name}
                    </option>
                  ))}
                </select>
                {errors.factory && (
                  <p className="mt-1 text-sm text-red-600">{errors.factory}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.department ? "border-red-500" : "border-gray-300"
                  }`}
                  name="department"
                  value={formData.department}
                  onChange={handleChanges}
                  disabled={!formData.factory}
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option
                      key={department.Department_Id}
                      value={department.Department_Id}
                    >
                      {department.Department_Name}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* User Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Category *
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.userCategory ? "border-red-500" : "border-gray-300"
                  }`}
                  name="userCategory"
                  value={formData.userCategory}
                  onChange={handleChanges}
                >
                  <option value="">Select User Category</option>
                  {userCategories.map((category) => (
                    <option key={category.Category} value={category.Category}>
                      {category.Category}
                    </option>
                  ))}
                </select>
                {errors.userCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.userCategory}
                  </p>
                )}
              </div>
            </div>

            {/* Password Reset Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="resetPassword"
                  checked={showPW}
                  onChange={handleResetPassword}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="resetPassword"
                  className="ml-2 text-gray-700 font-medium"
                >
                  Reset Password
                </label>
              </div>

              {showPW && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      name="password"
                      value={formData.password}
                      onChange={handleChanges}
                      placeholder="Enter new password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.cpassword ? "border-red-500" : "border-gray-300"
                      }`}
                      name="cpassword"
                      value={formData.cpassword}
                      onChange={handleChanges}
                      placeholder="Confirm new password"
                    />
                    {errors.cpassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.cpassword}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
