import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create a Context for User Data
const UserDataContext = createContext();

export const useUserData = () => {
  return useContext(UserDataContext);
};

// AuthProvider component that wraps your app and provides the context value
export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    userName: "",
    userCategory: "",
    userDepartment: "",
  });
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          const csrf = response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };

    const getUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user/getToken",
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        setUserData(response.data.data);
      } catch (error) {
        alert("Error while getting user data: " + error);
      }
    };

    if (csrfToken) {
      getUserData();
    } else {
      getCsrf();
    }
  }, [csrfToken]);

  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
};
