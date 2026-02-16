import axios from "axios";
import React, { useEffect, useState, useCallback, useRef } from "react";
import swal from "sweetalert2";
import {
  FaEdit,
  FaSearch,
  FaUserPlus,
  FaFilter,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const AManageUsers = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // State management
  const [csrfToken, setCsrfToken] = useState("");
  const [userList, setUserList] = useState([]);
  const [factories, setFactories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [selectedFactory, setSelectedFactory] = useState("");
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Refs
  const searchTimeoutRef = useRef(null);

  // Fetch CSRF token
  const fetchCsrfToken = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/getCSRFToken`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setCsrfToken(response.data.csrfToken);
        return response.data.csrfToken;
      }
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      throw error;
    }
  }, [apiUrl]);

  // Improved error handler
  const handleApiError = useCallback(
    (error, context = "fetch data") => {
      console.error(`Error ${context}:`, error);

      // Clear previous messages
      setError("");
      setSearchError("");
      setInfoMessage("");

      const status = error.response?.status;
      const errorData = error.response?.data;

      // Handle different error scenarios
      if (status === 400 && errorData?.message) {
        // Bad request (e.g., empty search key)
        setSearchError(errorData.message);
        setUserList([]);
      } else if (status === 401) {
        swal
          .fire({
            title: "Session Expired",
            text: "Your session has expired. Please login again.",
            icon: "warning",
            confirmButtonText: "Login",
            allowOutsideClick: false,
          })
          .then(() => {
            navigate("/login");
          });
      } else if (status === 403) {
        swal.fire({
          title: "Access Denied",
          text: "You don't have permission to perform this action.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else if (status === 404) {
        // Handle 404 specifically for search (backward compatibility)
        if (context.includes("search")) {
          setInfoMessage("No users found matching your search");
          setUserList([]);
        } else {
          setError("Resource not found");
        }
      } else if (status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection.");
      } else {
        // Handle API error messages from backend
        if (errorData?.message) {
          setError(errorData.message);
        } else {
          setError(`Failed to ${context}. Please try again.`);
        }
      }

      return errorData;
    },
    [navigate],
  );

  // Fetch users with improved error handling
  const fetchUsers = useCallback(
    async (factoryId = "", name = "") => {
      setIsLoading(true);
      setError("");
      setSearchError("");
      setInfoMessage("");

      try {
        let url = `${apiUrl}/user/get-all-users`;
        let config = {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        };

        if (factoryId) {
          url = `${apiUrl}/user/getUsers/${factoryId}`;
        } else if (name && name.trim()) {
          url = `${apiUrl}/user/getUsersByName`;
          config.params = {
            searchKey: name.trim(),
          };
        }

        const response = await axios.get(url, config);

        // Handle successful response
        if (response.status === 200) {
          const responseData = response.data;

          // Check if response has the new format
          if (responseData.success !== undefined) {
            if (responseData.success) {
              // New format: { success: true, data: [], message: "..." }
              setUserList(responseData.data || []);
              if (responseData.message && responseData.count === 0) {
                setInfoMessage(responseData.message);
              }
            } else {
              // API returned success: false
              handleApiError(
                { response: { status: 400, data: responseData } },
                "fetch users",
              );
            }
          } else {
            // Old format (backward compatibility)
            let users = [];
            if (factoryId) {
              users = responseData.data || [];
            } else if (name) {
              users = responseData.data || [];
            } else {
              users = responseData.UserList || [];
            }
            setUserList(users);

            // Show info message if no results found in search
            if (name && users.length === 0) {
              setInfoMessage("No users found matching your search");
            }
          }
        }
      } catch (error) {
        handleApiError(
          error,
          factoryId
            ? "filter users by factory"
            : name
              ? "search users"
              : "fetch users",
        );
        setUserList([]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, csrfToken, handleApiError],
  );

  // Fetch factories
  const fetchFactories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/department/getAll-Factories`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        },
      );
      if (response.data?.data) {
        setFactories(response.data.data);
      }
    } catch (error) {
      handleApiError(error, "fetch factories");
    }
  }, [apiUrl, csrfToken, handleApiError]);

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = await fetchCsrfToken();
        if (token) {
          await fetchFactories();
          await fetchUsers();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeData();
  }, []);

  // Delete user with improved feedback
  const handleDelete = useCallback(
    async (userId, userName) => {
      const result = await swal.fire({
        title: "Confirm Delete",
        html: `Are you sure you want to delete <strong>${userName}</strong>?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      setIsLoading(true);
      try {
        const response = await axios.delete(`${apiUrl}/user/delete/${userId}`, {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });

        if (response.status === 200) {
          swal.fire({
            title: "Success!",
            text: `User "${userName}" has been deleted successfully.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          // Refresh with current filters
          await fetchUsers(selectedFactory, searchKey);

          // Show success message in UI
          setInfoMessage(`User "${userName}" deleted successfully`);
          setTimeout(() => setInfoMessage(""), 3000);
        }
      } catch (error) {
        handleApiError(error, "delete user");
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, csrfToken, selectedFactory, searchKey, fetchUsers, handleApiError],
  );

  // Filter by factory
  const handleFactoryFilter = useCallback(
    async (factoryId) => {
      setSelectedFactory(factoryId);
      setSearchKey("");
      setSearchError("");
      setInfoMessage("");
      await fetchUsers(factoryId, "");
    },
    [fetchUsers],
  );

  // Search by name with validation
  const handleSearch = useCallback(
    async (searchValue = searchKey) => {
      const trimmedValue = searchValue.trim();

      // Validate search input
      if (!trimmedValue) {
        setSearchError("Please enter a name to search");
        return;
      }

      if (trimmedValue.length < 2) {
        setSearchError("Please enter at least 2 characters");
        return;
      }

      setSelectedFactory("");
      setSearchError("");
      await fetchUsers("", trimmedValue);
    },
    [fetchUsers, searchKey],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedFactory("");
    setSearchKey("");
    setSearchError("");
    setInfoMessage("");
    fetchUsers();
  }, [fetchUsers]);

  // Clear search only
  const clearSearch = useCallback(() => {
    setSearchKey("");
    setSearchError("");
    setInfoMessage("");
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    setSearchError(""); // Clear search error when typing

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim() === "") {
        clearSearch();
      } else if (value.trim().length >= 2) {
        handleSearch(value);
      }
    }, 500);
  };

  // Manual search trigger
  const triggerSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    handleSearch();
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Navigation
  const navigateToEdit = useCallback(
    (user) => {
      navigate("/edit-users", {
        state: {
          user, // New format
          visitors: user, // Old format for backward compatibility
        },
      });
    },
    [navigate],
  );

  const navigateToRegister = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  // Loading overlay
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-700 font-medium">Loading users...</p>
      </div>
    </div>
  );

  // Error/Success Message Components
  const ErrorMessage = ({ message }) => (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
      <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-red-700 font-medium">Error</p>
        <p className="text-red-600 text-sm">{message}</p>
      </div>
    </div>
  );

  const InfoMessage = ({ message }) => (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
      <svg
        className="text-blue-500 mr-3 mt-0.5 flex-shrink-0 w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <p className="text-blue-700 font-medium">Information</p>
        <p className="text-blue-600 text-sm">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 p-3 sm:p-4 md:p-6 w-full">
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
          Users Management
        </h1>
        <p className="text-gray-600 text-center text-sm sm:text-base">
          Manage system users and their permissions
        </p>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error} />}
      {searchError && <ErrorMessage message={searchError} />}
      {infoMessage && <InfoMessage message={infoMessage} />}

      {/* Controls Section */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 md:mb-6 border border-gray-200">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
          {/* Filter Section */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Factory:
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={selectedFactory}
                onChange={(e) => handleFactoryFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              >
                <option value="">All Factories</option>
                {factories.map((factory) => (
                  <option key={factory.Factory_Id} value={factory.Factory_Id}>
                    {factory.Factory_Name}
                  </option>
                ))}
              </select>
              {(selectedFactory || searchKey) && (
                <button
                  onClick={clearFilters}
                  className="p-2 text-gray-500 hover:text-red-600 flex-shrink-0 transition-colors"
                  title="Clear all filters"
                  type="button"
                >
                  <FaTimes size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                value={searchKey}
                onChange={handleSearchChange}
                placeholder="Search by name (min. 2 chars)..."
                className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors ${
                  searchError ? "border-red-300" : "border-gray-300"
                }`}
                onKeyPress={(e) => e.key === "Enter" && triggerSearch(e)}
              />
              {searchKey ? (
                <button
                  onClick={clearSearch}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  type="button"
                  title="Clear search"
                >
                  <FaTimes size={14} />
                </button>
              ) : null}
              <button
                onClick={triggerSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                type="button"
                title="Search"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Add User Button */}
          <button
            onClick={navigateToRegister}
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg"
            type="button"
          >
            <FaUserPlus className="mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userList.length > 0
                ? userList.map((user, index) => (
                    <tr
                      key={user.user_Id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.user_Id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {user.user_Name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.user_email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.user_category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {user.Department?.Department_Name || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigateToEdit(user)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Edit user"
                            type="button"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(user.user_Id, user.user_Name)
                            }
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete user"
                            type="button"
                          >
                            <MdDeleteForever size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="text-gray-400">
                          <svg
                            className="mx-auto h-12 w-12 mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                          <p className="text-lg font-medium mb-1">
                            No users found
                          </p>
                          <p className="text-sm">
                            {searchKey || selectedFactory
                              ? "Try adjusting your search criteria"
                              : "Get started by adding your first user"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {userList.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Showing <span className="font-semibold">{userList.length}</span>{" "}
                user{userList.length !== 1 ? "s" : ""}
                {(searchKey || selectedFactory) && " (filtered)"}
              </p>
              {searchKey && (
                <p className="text-sm text-gray-500">
                  Search: "<span className="font-medium">{searchKey}</span>"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {/* <div className="">Hello world</div> */}
    </div>
  );
};

export default AManageUsers;
