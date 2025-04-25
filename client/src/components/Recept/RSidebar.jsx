import React, { useState } from "react";
// import "./RSidebar.css";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { FaPersonCirclePlus } from "react-icons/fa6";
import { FaPersonCircleCheck } from "react-icons/fa6";
import { TbReportSearch } from "react-icons/tb";
import vmsLogo from "../../assets/vmsLogo2.png";

const RSidebar = ({ handleSidebarClick }) => {
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

      <button
        type="button"
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200 border-gray-400 text-gray-300 font-bold ${isActive == "New Visitors" ? "active-sidebar" : ""
          } lg:min-h-16`}
        onClick={() => {handleSidebarClick("visitor"); handleIsActive("New Visitors")}}
      >
        <div className="flex flex-row pl-2">
          <span>
            <FaPersonCircleExclamation className="text-2xl mr-2" />
          </span>
          New Visitors
        </div>
      </button>
      <button
        type="button"
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200  text-gray-300 font-bold hover:hover-sidebar ${isActive == "Sudden Visit" ? "active-sidebar" : ""
          }`}
        onClick={() => { handleSidebarClick("suddenVisit"); handleIsActive("Sudden Visit") }}
      >
        <div className="flex flex-row pl-2">
          <span>
            <FaPersonCirclePlus className="text-2xl mr-2" />
          </span>
          Sudden Visit
        </div>
      </button>

      <button
        type="button"
        className={`w-full min-h-14 hover:bg-[#5151A5] hover:text-gray-200  text-gray-300 font-bold hover:hover-sidebar ${isActive == "Generate Reports" ? "active-sidebar" : ""
          }`}
        onClick={() => { handleSidebarClick("getReports"); handleIsActive("Generate Reports") }}
      >
        <div className="flex flex-row pl-2">
          <span>
            <TbReportSearch className="text-2xl mr-2" />
          </span>
          Generate Reports
        </div>
      </button>
    </aside>
  );
};

export default RSidebar;
