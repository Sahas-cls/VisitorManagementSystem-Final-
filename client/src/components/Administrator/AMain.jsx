import React, { useEffect, useState } from "react";
import Header from "../../Header";
import UseWindowWidth from "../UseWindowWidth";
import ASidebar from "./ASidebar";
import AManageUsers from "./AManageUsers";

const AMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("manageUsers");
  const screenSize = UseWindowWidth(); // Get the screen width from the custom hook
  // const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700); // Set initial sidebar state based on screen size
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700);
  const handleSidebarClick = (value) => {
    setView(value);
  };

  

  useEffect(() => {
    // This effect runs when screenSize changes (e.g., window resize)
    if (screenSize < 700) {
      setToggleSidebar(false); // Hide sidebar on small screens
    } else {
      setToggleSidebar(true); // Show sidebar on larger screens
    }

    // console.log("toggleSidebar:", toggleSidebar);
  }, [screenSize]); // Dependency array ensures it runs when screen size changes

  return (
    <div className="max-h-screen overflow-y-hidden">
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className="mainContainer flex" style={{ backgroundColor: "" }}>
        {toggleSidebar ? (
          <ASidebar onSidebarClick={handleSidebarClick} />
        ) : null}
        {view === "manageUsers" && (
          <AManageUsers
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            // setToggleSidebar={setToggleSidebar}
          />
        )}
        {/* {view === "report" && <CReport />} */}
        {/* {view === "ApprovedVisitors" && (
          <CApprovedVisitors
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            // setToggleSidebar={setToggleSidebar}
          />
        )} */}
      </div>
    </div>
  );
};

export default AMain;
