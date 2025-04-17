import React from "react";
// import "./RSidebar.css";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { FaPersonCirclePlus } from "react-icons/fa6";
import { FaPersonCircleCheck } from "react-icons/fa6";
import { TbReportSearch } from "react-icons/tb";

const RSidebar = ({ handleSidebarClick }) => {
  return (
    <aside className="rSidebar" style={{marginRight: "0.5px"}}>
      <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("visitor")}
      >
        <div className="flex">
          <span>
            <FaPersonCircleExclamation className="lg:text-2xl mr-2" />
          </span>
          New Visitors
        </div>
      </button>
      <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("suddenVisit")}
      >
        <div className="flex">
          <span>
            <FaPersonCirclePlus className="lg:text-2xl mr-2" />
          </span>
          Sudden Visit
        </div>
      </button>

      <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("getReports")}
      >
        <div className="flex">
          <span>
            <TbReportSearch className="lg:text-2xl mr-2" />
          </span>
          Generate Reports
        </div>
      </button>
    </aside>
  );
};

export default RSidebar;
