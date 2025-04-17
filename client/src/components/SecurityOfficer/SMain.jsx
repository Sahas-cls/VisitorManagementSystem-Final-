import React from "react";
import Header from "../../Header";
import SSidebar from "./RSidebar";
import SContainer from "./SContainer";

const SMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  return (
    <div className="w-full h-full">
      {/* <p>{userFactoryId}</p> */}
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        // toggleSidebar={toggleSidebar}
        // setToggleSidebar={setToggleSidebar}
      />

      <div className="flex">
        {/* <SSidebar /> */}
        <SContainer
          userId={userId}
          userName={userName}
          userCategory={userCategory}
          userDepartment={userDepartment}
          userDepartmentId={userDepartmentId}
          userFactoryId={userFactoryId}
        //   setToggleSidebar={setToggleSidebar}
        />
      </div>
    </div>
  );
};

export default SMain;
