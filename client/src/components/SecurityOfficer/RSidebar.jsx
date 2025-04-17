import React from "react";
import "./RSidebar.css";

const SSidebar = ({ handleSidebarClick }) => {
  return (
    <aside>
      <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("visitor")}
      >
        Visitor
      </button>
      {/* <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("ApprovedVisitors")}
      >
        Approved Visitors
      </button> */}
      {/* <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("report")}
      >
        Reports
      </button> */}

      {/* Sudden Visit button */}
      {/* <button
        type="button"
        className="navBtn"
        onClick={() => handleSidebarClick("suddenVisit")}
      >
        Sudden Visit
      </button> */}
    </aside>
  );
};

export default SSidebar;
