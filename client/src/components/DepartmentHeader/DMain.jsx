import React, { useState, useEffect } from "react";
import DSidebar from "./DSidebar";
import DContainer from "./DContainer";
import DReport from "./DReport";
import axios from "axios";
import Header from "../../Header";
import DApprovedVisitors from "./DApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";

const DMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  console.log("factory id", userFactoryId);
  const [csrfToken, setCsrfToken] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const [userData, setUserData] = useState({
    userName: "",
    userCategory: "",
    userDepartment: "",
  });
  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          console.log(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

    const getUserData = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/user/getToken`,
          { withCredentials: true },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        console.log(response.data.data);
        setUserData(response.data.data);
      } catch (error) {
        alert("Error while getting user data: " + error);
      }
    };
    getUserData();

    // alert(userData);
    // console.log(userData);
  }, []);

  const [view, setView] = useState("visitor");
  const screenSize = UseWindowWidth();
  // console.log(screenSize)
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 768);
  // alert(userCategory);
  const handleSidebarClick = (value) => {
    setView(value);
  };

  useEffect(() => {
    // This effect runs when screenSize changes (e.g., window resize)
    if (screenSize < 768) {
      setToggleSidebar(false); // Hide sidebar on small screens
    } else {
      setToggleSidebar(true); // Show sidebar on larger screens
    }
  }, [screenSize]);

  return (
    <div>
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className="mainContainer flex">
        {toggleSidebar ? (
          <DSidebar handleSidebarClick={handleSidebarClick} />
        ) : null}
        {/* {toggleSidebar ? <DSidebar onSidebarClick={handleSidebarClick} /> : ""} */}
        {view === "visitor" && (
          <DContainer
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            setToggleSidebar={setToggleSidebar}
          />
        )}
        {view === "approvedVisitors" && (
          <DApprovedVisitors
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            setToggleSidebar={setToggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default DMain;
