import React, { useState } from "react";
// import "./CSidebar.css";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { FaPersonCircleCheck } from "react-icons/fa6";
import vmsLogo from "../../assets/vmsLogo2.png";

const CSidebar = ({ onSidebarClick }) => {
  const [isActive, setisActive] = useState("New Visitors");
  const handleIsActive = (item) => {
    // alert(item);
    setisActive(item);
  };
  return (
    <aside className="bg-navy w-4/6 p-0 z-50 absolute sm:w-3/6 md:relative md:w-2/6 lg:relative lg:w-1/5 w-4/6 sm:w-3/6 md:relative md:w-2/6 lg:w-1/4 lg:max-w-[320px] ">
      <div className="flex justify-center mb-5">
        <img src={vmsLogo} alt="vms Logo" width="170px" />
      </div>

      <button
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200  border-b-2 border-gray-400 text-gray-300 font-bold ${isActive == "New Visitors" ? "active-sidebar" : ""
          } lg:min-h-16`}
        onClick={() => {
          handleIsActive("New Visitors");
          onSidebarClick("visitor");
        }}
      >
        <div className={`flex h-full w-full pl-2`}>
          <FaPersonCircleExclamation className="text-2xl" />
          <span className="ml-2">New Visitors</span>
        </div>
      </button>

      <button
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200  text-gray-300 font-bold hover:hover-sidebar ${isActive == "Approved Visitors" ? "active-sidebar" : ""
          }`}
        onClick={() => {
          handleIsActive("Approved Visitors");
          onSidebarClick("ApprovedVisitors");
        }}
      >
        <div className="flex flex-row pl-2">
          <FaPersonCircleCheck className="text-2xl" />
          <span className="ml-2">Allowed Visitors</span>
        </div>
      </button>

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

export default CSidebar;
