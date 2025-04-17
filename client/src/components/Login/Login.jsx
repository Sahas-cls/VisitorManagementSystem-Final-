import React, { useState, useEffect } from "react";
import "./Login.css";
import { FaUser, FaVoicemail } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import axios from "axios";
import { FaRegUserCircle } from "react-icons/fa";
import { GrCopy } from "react-icons/gr";
import swal from "sweetalert2";
import sidebarImg from '../../assets/sidebarImg6.jpg'

const Login = () => {
  const [csrfToken, setCsrfToken] = useState("");
  const [Serrors, setSErrors] = useState({});

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();
  }, []);

  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  //use state for set errors
  const [errors, seterrors] = useState({});
  //constant to store errors temporary
  const error = {};

  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Copy the existing errors to maintain previous error messages
    let newErrors = { ...errors };

    switch (name) {
      case "email":
        if (!value) {
          newErrors.email = "Please enter your email";
        } else {
          const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailValidator.test(value)) {
            newErrors.email = "Invalid email";
          } else {
            delete newErrors.email; // Remove the error if it's valid
          }
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password cannot be empty";
        } else {
          if (value.trim().length < 6) {
            newErrors.password = "Password is too short";
          } else {
            delete newErrors.password; // Remove the error if it's valid
          }
        }
        break;

      default:
        break;
    }

    // Update the error state with the modified errors
    seterrors(newErrors);

    // Update form data state
    setformData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    //validating email
    if (!formData.email) {
      error.email = "Please enter your email";
    } else {
      const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailValidator.test(formData.email)) {
        error.email = "Invalid email";
      }
    }

    if (!formData.password) {
      error.password = "Password cannot be empty";
    } else {
      if (formData.password.trim().length < 6) {
        error.password = "Password too short";
      }
    }
    seterrors(error);

    if (Object.keys(error).length === 0) {
      try {
        // alert("sending data");
        const response = await axios.post(
          "http://localhost:3000/user/login",
          formData,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        // alert("Hello");
        if (response.status === 200) {
          // alert("Login success");
          // console.log(response);
          // alert("login success");
          await swal.fire({
            title: "User login success",
            text: "",
            icon: "success", // You can use 'question', 'warning', 'info', etc.
            showCancelButton: false,
            confirmButtonText: "Ok",
            cancelButtonText: "No, cancel!",
            confirmButtonColor: "#d33", // Custom confirm button color (red in this case)
            cancelButtonColor: "#3085d6", // Custom cancel button color (blue)
          });
          setSErrors({ type: "success", text: response.data.msg });
          // alert("login success");
          // await delay(3000);
          // alert(response.data.msg);
          // console.log(response.data);
          const userCategory = response.data.data.userCategory || "unknown";
          console.log(userCategory);
          // alert(userCategory);
          // alert(`response data: ${userCategory}`);

          switch (userCategory) {
            case "Department Head":
              window.location.href = "/dashboard-d-head";
              break;
            case "Department User":
              // alert("duser");
              window.location.href = "/dashboard-clerk";
              break;
            case "Reception":
              window.location.href = "/dashboard-recept";
              break;
            case "HR User":
              window.location.href = "/dashboard-hr";
              break;
            case "Security Officer":
              window.location.href = "/dashboard-security-officer";
              break;
            case "Admin":
              // alert('admin')
              window.location.href = "/dashboard-administrator";
              break;
            default:
              // alert("xknown user category");
              break;
          }
        } else {
          // alert(response.data.msg);
          throw Error(response.data.msg);
          alert("Login failed");
        }

        // alert(response.data);
        console.log(response.data);
      } catch (error) {
        // alert(error);
        const errorMessage =
          error.response && error.response.data && error.response.data.msg
            ? error.response.data.msg
            : error.message;
        setSErrors({ type: "error", text: errorMessage });
        // setSErrors({ type: "error", text: error });
      }
    }
  };

  //function for copy a text to clipboard
  const copyToClipboard = (txtCopy) => {
    // const textToCopy = "Your text to be copied";

    navigator.clipboard
      .writeText(txtCopy)
      .then(() => {
        alert("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="w-screen min-h-screen bg-gray-300 flex justify-center ">
      <div className="w-full h-container flex justify-center md:shadow-custom md:w-3/4 md:my-3 lg:w-3/6 lg:my-3 lg:p-0">
        <div className="left-div hidden sm:block sm:w-1/4 sm:min-h-full bg-no-repeat bg-cover bg-center">
          {/* <h1>Welcome</h1>
      <h2>to <br /> Visitor Management System</h2> */}
          {/* <img src={sidebarImg} alt=""/> */}
        </div>

        <div className="right-div w-full flex flex-col items-center sm:w-3/4 lg:w-3/4">
          <FaRegUserCircle className="text-6xl mt-3" />
          <h1 className="text-center mb-2">Member Login</h1>
          {Serrors != "" ?
            <div className="text-red-600 text-center">
              {Serrors?.text}
            </div>

            : ""}
          <form className="flex flex-col w-full px-8 items-center" onSubmit={handleSubmit}>
            <div className="w-full px-2">
              <label htmlFor="email">Email: </label>
              <div className="bg-white flex items-center w-full p-1 rounded-md ">
                <input
                  className="w-full h-full outline-none p-1.5 bg-white"
                  type="text"
                  name="email"
                  onChange={handleChanges}
                  autoComplete="off"
                />
                <MdEmail className="text-2xl" />
              </div>
              <br />
              {errors.email && (
                <p className="text-red-600 text-center" style={{ marginTop: "-25px" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="w-full px-2">
              <label htmlFor="password">Password: </label>
              <div className="bg-white flex items-center w-full p-1 rounded-md">
                <input
                  className="w-full h-full outline-none p-1.5 bg-white"
                  type="password"
                  name="password"
                  onChange={handleChanges}
                  autoComplete="off"
                />
                <RiLockPasswordFill className="text-2xl" />
              </div>
              <br />
              <p>
                {errors.password && (
                  <p className="text-red-600 text-center" style={{ marginTop: "-25px" }}>
                    {errors.password}
                  </p>
                )}
              </p>
            </div>

            <div>
              <div>
                {/* <input type="checkbox" name="rememberMe" id="" />{" "} */}
                {/* <span>Remember Me?</span> */}
              </div>

              <div>
                <p>
                  <a className="text-center text-blue-700 hover:text-red-500 hover:underline duration-150" href="/forgot-password">
                    Forgot Password?
                  </a>
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col items-center mt-3">
              <button className="text-center w-3/4 bg-green-600 hover:bg-green-500 text-white font-bold p-1 rounded-md mb-4" type="submit">
                Login
              </button>
              <br />
              <button
                type="button"
                className="text-center w-3/4 bg-blue-600 hover:bg-blue-500 text-white font-bold p-1 rounded-md mt-[-10px]"
                onClick={() =>
                  (window.location.href = "http://localhost:5173/register")
                }
              >
                Create an Account
              </button>
            </div>

            {/* <div>
          <h5>
            Not a Member?{" "}
            <span>
              {" "}
              <a href="http://localhost:5173/register">
                Create an Account
              </a>
            </span>
          </h5>
          <button onClick={() => alert("Incorrect")}>
            Create an Account
          </button>
        </div> */}

            <div className="mb-2">
              <p className="text-center mt-3 text-base">Please send below link to visitor</p>
              <span className="flex mt-2 items-center ">
                <GrCopy
                  className="mr-1 hover:text-red-600 hover:font-bold text-xl"
                  onClick={() =>
                    copyToClipboard(
                      "http://localhost:5173/visitor-registration"
                    )
                  }
                />
                <a
                  className="hover:text-red-600 text-center"
                  target="blank"
                  href="http://localhost:5173/visitor-registration"
                >
                  http://localhost:5173/visitor-registration
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>

  );

};

export default Login;
