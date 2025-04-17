import React, { useEffect, useState } from "react";
import Header from "../../Header";
import RSidebar from "./RSidebar";
import RConteiner from "./RContainer";
import SuddenVisit from "./SuddenVisit";
import UseWindowWidth from "../UseWindowWidth";
import RDashboard from "./RDashboard";

const RMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("visitor");
  // alert(view);

  const handleSidebarClick = (value) => {
    // alert(value);
    setView(value); // Update the view state with the clicked sidebar option
  };

  const [toggleSidebar, setToggleSidebar] = useState(false);
  const screenSize = UseWindowWidth();
  useEffect(() => {
    // This effect runs when screenSize changes (e.g., window resize)
    if (screenSize < 700) {
      setToggleSidebar(false); // Hide sidebar on small screens
    } else {
      setToggleSidebar(true); // Show sidebar on larger screens
    }

    console.log("toggleSidebar:", toggleSidebar);
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
          <RSidebar handleSidebarClick={handleSidebarClick} />
        ) : null}
        {/* Pass the function down to RSidebar */}
        {view === "visitor" && (
          <RConteiner
            handleSidebarClick={handleSidebarClick}
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
            // setToggleSidebar={setToggleSidebar}
          />
        )}
        {view === "suddenVisit" && (
          <SuddenVisit
            userFactoryId={userFactoryId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            toggleSidebar={toggleSidebar}
            // setToggleSidebar={setToggleSidebar}
          />
        )}
        {view === "getReports" && (
          <RDashboard
            userFactoryId={userFactoryId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            toggleSidebar={toggleSidebar}
          />
        )}
        {/* Add other views as needed */}
      </div>
    </div>
  );
};

export default RMain;
