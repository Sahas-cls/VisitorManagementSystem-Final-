import React from "react";
import { FaUserCog } from "react-icons/fa";
// import "./CSidebar.css";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { FaPersonCircleCheck } from "react-icons/fa6";

const ASidebar = ({ onSidebarClick }) => {
  return (
    <aside className="cSidebar">
      <button
        style={{ backgroundColor: "#2d545e", color: "white" }}
        className="navBtn"
        onClick={() => onSidebarClick("manageUsers")}
      >
        <div className="flex">
          <FaUserCog className="lg:text-2xl" />
          <span className="ml-2">Manage Users</span>
        </div>
      </button>
      {/* <button
        className="navBtn"
        style={{ backgroundColor: "#2d545e", color: "white" }}
        onClick={() => onSidebarClick("ApprovedVisitors")}
      >
        <div className="flex">
          <FaPersonCircleCheck className="lg:text-2xl" />
          <span className="ml-2">Allowed Visitors</span>
        </div>
      </button> */}

      {/* <button
        className="navBtn"
        style={{backgroundColor: "#2d545e", color: "white"}}
        onClick={() => onSidebarClick("ApprovedVisitors")}
      >
        Edited Visitors
      </button> */}

      {/* <button className="navBtn" onClick={() => onSidebarClick("report")}>
        Reports
      </button> */}
    </aside>
  );
};

export default ASidebar;
