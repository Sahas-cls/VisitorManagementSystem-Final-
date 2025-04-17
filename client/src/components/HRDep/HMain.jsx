import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../Header";
import HSidebar from "./HSidebar";
import HConteiner from "./HContainer";
import HApprovedVisitors from "./HApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";

const HMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [csrfToken, setCsrfToken] = useState("");
  const [userData, setUserData] = useState({
    userName: "",
    userCategory: "",
    userDepartment: "",
  });
  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
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
          "http://localhost:3000/user/getToken",
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
  // alert(userCategory);
  const handleSidebarClick = (value) => {
    setView(value);
  };

  const screenSize = UseWindowWidth(); // Get the screen width from the custom hook
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700);

  useEffect(() => {
    // This effect runs when screenSize changes (e.g., window resize)
    if (screenSize < 700) {
      setToggleSidebar(false); // Hide sidebar on small screens
    } else {
      setToggleSidebar(true); // Show sidebar on larger screens
    }
  }, [screenSize]); // Dependency array ensures it runs when screen size changes

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
          <HSidebar onSidebarClick={handleSidebarClick} />
        ) : null}
        {/* {toggleSidebar ? <HSidebar onSidebarClick={handleSidebarClick} /> : ""} */}
        {view === "visitor" && (
          <HConteiner
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
          <HApprovedVisitors
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
          />
        )}
      </div>
    </div>
  );
};

export default HMain;
