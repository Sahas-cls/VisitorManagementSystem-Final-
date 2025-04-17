import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import "./VisitorSuccess.css"; // Import the CSS file

const VisitorSuccess = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center success-div" style={{ height: "100vh" }}>
      <FaCheckCircle style={{ color: "green", fontSize: "4rem" }} className="success-icon" />
      <h1 className="text-center mt-2 success-text">Visitor Registration success</h1>
    </div>
  );
};

export default VisitorSuccess;