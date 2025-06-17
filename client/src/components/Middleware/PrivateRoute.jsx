import React, { createContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import RMain from "../Recept/RMain";
import HMain from "../HRDep/HMain";
import CMain from "../DeparmentClerk/CMain";
import DMain from "../DepartmentHeader/DMain";
import SMain from "../SecurityOfficer/SMain";
import AMain from "../Administrator/AMain";

const PrivateRoute = ({ element }) => {
  const userDataContext = createContext();

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userData, setUserData] = useState({
    userId: "",
    userName: "",
    userdepartment: "",
    useruserCategory: "",
    userDepartmentId: "",
    userFactoryId: "",
  });
  const [userCategory, setUserCategory] = useState("");
  const [userName, setUserName] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [userDepartmentId, setUserDepartmentId] = useState("");
  const [userFactoryId, setUserFactoryId] = useState("");
  const [userId, setUserId] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  //const apiUrl = "http://128.199.26.137";
  //console.log(apiUrl);

  // alert("private route: " + userDepartmentId);
  // console.log("Private route running");
  useEffect(() => {
    const getToken = async () => {
      // console.log("getting user token");
      try {
        // console.log("inside the try");
        const response = await axios.get(`${apiUrl}/user/getToken`, {
          withCredentials: true,
        });

        // console.log("response", response.data.data.userName);

        if (response.data.data.userName) {
          // console.log(response);
          setUserData({
            userId: response.data.data.userId,
            userName: response.data.data.userName,
            userCategory: response.data.data.userCategory,
            userDepartment: response.data.data.department,
            userDepartmentId: response.data.data.departmentId,
            userFactoryId: response.data.data.factoryId,
          });

          // alert("factory id, ", response.data.data.factoryId);

          // console.log("user data", response.data);
          setIsAuthenticated(true);
          setUserName(response.data.data.userName);
          setUserId(response.data.data.userId);
          // alert(response.data.data.userName);
          setUserCategory(response.data.data.userCategory);
          setUserDepartment(response.data.data.department);
          setUserDepartmentId(response.data.data.departmentId);
          setUserFactoryId(response.data.data.factoryId);
          // alert(response.data.data.userCategory);
          // alert(userFactory);
        } else {
          // console.log("Inside the else");
          setIsAuthenticated(false);
          //alert("Authentication fail");
        }
      } catch (error) {
        // console.log("Inside the catch");
        console.error("Error verifying token:", error.message);
        setIsAuthenticated(false);
      }
    };

    getToken();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Redirect based on user role
    //alert(userCategory);
  // console.log("user factory Id private routes: " + userFactoryId);
  switch (userCategory) {
    case "Reception":
      return (
        <RMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
    case "HR User":
      return (
        <HMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
    //!
    case "Department User":
      return (
        <CMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
    case "Department Head":
      return (
        <DMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
    case "Security Officer":
      return (
        <SMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
    case "Admin":
      //  alert("admin login");
      return (
        <AMain
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        />
      );
      // alert("admin");
      break;

    default:
      if (!isAuthenticated) {
        return <Navigate to="/" />;
      }
    // return <Navigate to="/unauthorized" />;
  }
};

export { PrivateRoute };
