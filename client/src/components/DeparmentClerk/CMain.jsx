import React, { useEffect, useState } from "react";
import CSidebar from "./CSidebar";
import CConteiner from "./CConteiner";
import CReport from "./CReport";
import Header from "../../Header";
import CApprovedVisitors from "./CApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";

const CMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("visitor");
  const screenSize = UseWindowWidth(); // Get the screen width from the custom hook
  // const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700); // Set initial sidebar state based on screen size
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 768);
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

    console.log("toggleSidebar:", toggleSidebar);
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
      <div className="mainContainer flex" style={{ backgroundColor: "" }}>
        {toggleSidebar ? (
          <CSidebar onSidebarClick={handleSidebarClick} />
        ) : null}
        {view === "visitor" && (
          <CConteiner
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            // setToggleSidebar={setToggleSidebar}
          />
        )}
        {view === "report" && <CReport />}
        {view === "ApprovedVisitors" && (
          <CApprovedVisitors
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            // setToggleSidebar={setToggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default CMain;
