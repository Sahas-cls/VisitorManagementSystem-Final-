import React from "react";
// import "./HSidebar.css";
import { HiUserGroup } from "react-icons/hi2";
import { FaUserCheck } from "react-icons/fa6";

<HiUserGroup className="text-2xl text-white hover:text-black hbtn-icons" />



const HSidebar = ({ onSidebarClick }) => {
  return (
    <aside className="hSidebar">
      <button className="navBtn" onClick={() => onSidebarClick("visitor")}>
       <span className="flex gap-3"><HiUserGroup className="hbtn-icons"/>&nbsp; Visitor</span>
      </button>
      <button
        className="navBtn"
        onClick={() => onSidebarClick("approvedVisitors")}
      >
       <span className="flex gap-3"><FaUserCheck className="hbtn-icons"/> Approved Visitors</span>
      </button>
    </aside>
  );
};

export default HSidebar;
