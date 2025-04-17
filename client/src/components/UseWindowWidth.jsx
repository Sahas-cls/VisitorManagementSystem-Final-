import React, { useState, useEffect } from "react";

const UseWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);
    // console.log(window.innerWidth);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowWidth;
};

export default UseWindowWidth;
