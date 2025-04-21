import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import companyLogo from "./assets/compLogo.png";
import "./Header.css";
import { ImExit } from "react-icons/im";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import UseWindowWidth from "./components/UseWindowWidth";
import vmsLogo from "./assets/vmsLogo.png";

const Header = ({
  userName,
  userCategory,
  userDepartment,
  toggleSidebar,
  setToggleSidebar,
}) => {
  const [csrfToken, setCsrfToken] = useState("");
  const [userVisible, setUserVisible] = useState(false);
  // console.log(toggleSidebar);
  let screenSize = UseWindowWidth();
  const vmsLogo = "../assets/vmsLogo.png";
  // alert(screenSize);

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          const csrf = await response.data.csrfToken;
          // console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching CSRF token: ${error}`);
      }
    };
    getCsrf();

    const sidebarscreenSize = () => {
      if (screenSize < 700) {
        setToggleSidebar(false);
        console.log("smaller that 700px ");
      }
    };

    sidebarscreenSize;
  }, []);

  // useEffect(() => {}, [screenSize]);

  const changeUserDrop = () => {
    setUserVisible(!userVisible);
  };

  const logout = async (e) => {
    e.preventDefault();
    // alert("calling logout");
    // alert("Logging out");

    try {
      // Send the logout request to the server
      // alert("calling login aout");
      const response = await axios.post(
        "http://localhost:3000/user/logout",
        {},
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      // alert(response.data);
      console.log(response.data.msg); // Log success message

      // Check if logout was successful
      if (response.status === 200) {
        // alert("to root page");
        navigate("/"); // Redirect to the root page after successful logout
      } else {
        console.log("Logout failed: ", response.data); // Handle error if logout wasn't successful
      }
    } catch (error) {
      // Handle any errors during logout
      console.error(
        "Logout failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <header className=" bg-gradient-to-r from-[#3b82f6] to-blue-900 min-h-20 flex justify-between px-9 border-b-2 border-b-white">
      <div className="flex items-center ml-9">
        <GiHamburgerMenu
          className={`text-3xl text-white header-icons duration-300 ${toggleSidebar ? "rotate-180" : ""}`}
          onClick={() => setToggleSidebar(!toggleSidebar)}
        />
      </div>

      {/* <div className="vmsLogo-div">&nbsp;</div> */}

      {/* <img width="200px" className="" src={companyLogo} alt="Logo img" /> */}

      <div className="flex items-center justify-center">
        <div className="text-center flex items-center">
          <h1 className="mr-4 text-xl font-semibold mt-6 text-white header-greeting">
            Hi{" "}
            <span className="header-greeting" style={{ color: "White" }}>
              {userName}
            </span>
          </h1>

          {/* <p className="text-right mr-4">{userDepartment}</p> */}

          <FaUserCircle
            className="uIcon text-white header-icons"
            onClick={changeUserDrop}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div
          className={`userDropdown ${userVisible === true ? "visible" : "noneVisible"
            }`}
        >
          <ul>
            {/* <li>{userName}</li> */}
            <li>{userDepartment}</li>
            <li>{userCategory}</li>
            <form>
              <li>
                <button onClick={logout}>
                  <ImExit style={{ fontSize: "15px" }} />
                  Logout
                </button>
              </li>
            </form>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
