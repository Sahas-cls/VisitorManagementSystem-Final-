import React, { useEffect, useState } from "react";
// import "./HSidebar.css";
import { HiUserGroup } from "react-icons/hi2";
import { FaUserCheck } from "react-icons/fa6";
import vmsLogo from "../../assets/vmsLogo2.png";

<HiUserGroup className="text-2xl text-white hover:text-black hbtn-icons" />



const HSidebar = ({ onSidebarClick }) => {
  const [isActive, setisActive] = useState("New Visitors");
  const handleIsActive = (item) => {
    // alert(item);
    setisActive(item);
  };
  return (
    <aside className="bg-navy w-4/6 p-0 z-50 absolute sm:w-3/6 md:relative md:w-2/6 lg:relative lg:w-1/5 w-4/6 sm:w-3/6 md:relative md:w-2/6 lg:w-1/4 lg:max-w-[320px]">

      <div className="flex justify-center mb-5">
        <img src={vmsLogo} alt="vms Logo" width="170px" />
      </div>

      <button className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200 border-gray-400 text-gray-300 font-bold ${isActive == "New Visitors" ? "active-sidebar" : ""
        } lg:min-h-16`} onClick={() => {onSidebarClick("visitor"); handleIsActive("New Visitors")}} >
        <span className="flex gap-3"><HiUserGroup className="text-2xl ml-2" />&nbsp; Visitor</span>
      </button>
      <button
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200  text-gray-300 font-bold hover:hover-sidebar ${isActive == "Approved Visitors" ? "active-sidebar" : ""
          }`}
        onClick={() => { onSidebarClick("approvedVisitors"); handleIsActive("Approved Visitors"); }}
      >
        <span className="flex gap-3"><FaUserCheck className="text-2xl ml-2" /> Approved Visitors</span>
      </button>
    </aside>
  );
};

export default HSidebar;
