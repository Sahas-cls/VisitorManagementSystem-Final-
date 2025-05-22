import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "./ForgotPassword.css";
import axios from "axios";
import Swal from "sweetalert2";
import { MdLockReset } from "react-icons/md";
// import React from "react";
import resetPasswordImg from "../../../public/reset-password.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [emailErrors, setEmailErrors] = useState();
  const [serverSideMsg, setServerSideMsg] = useState({});
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
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

  const handleEmalChange = (e) => {
    const userEmail = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(userEmail)) {
      setEmailErrors("");
    } else {
      setEmailErrors("Invalid Email");
    }
    // alert(userEmail);
    setEmail(userEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailErrors("");

      const formData = { email: email };

      try {
        const response = await axios.post(
          `${apiUrl}/user/forgot-password`,
          formData,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setServerSideMsg({
            success:
              "We've sent you an email with instructions to reset your password. Please check your inbox.",
          });
        }
      } catch (error) {
        console.error("Error caught:", error);

        if (error.response) {
          console.log("Server response error:", error.response);

          if (error.response.status === 400) {
            // alert("json " + error.response.data.msg);
            Swal.fire({
              title: "Provided credentials doesn't include in our database",
              body: "",
              icon: "warning",
            });
            setServerSideMsg({ error: error.response.data.msg });
          } else {
            setServerSideMsg({
              error: "An unexpected error occurred. Please try again later.",
            });
          }
        } else {
          setServerSideMsg({
            error: "Network error. Please check your connection and try again.",
          });
        }
      }
    } else {
      setEmailErrors("Invalid email format");
    }
  };

  const goBack = (e) => {
    // alert("going back");
    e.preventDefault();
    navigate(-1);
  };

  return (
    <div className="w-screen h-screen flex bg-gray-400/40 md:bg-white justify-center items-center">
      <div className="forgotPassword-div w-full md:w-3/6 md:min-h-5/6 md:bg-gray-400/40 md:p-2 xl:w-2/6 xl:min-h-5/6  md:border-2 md:border-black/30 md:shadow-lg rounded-md">
        <form onSubmit={handleSubmit} className="">
          <div className="sub-div">
            <div className="form-div flex flex-col p-5">
              <h1 className="forgot-title text-center text-xl mb-3 ">
                Reset Password
              </h1>
              <div className="flex justify-center mb-4">
                <img src={resetPasswordImg} alt="" className="w-40" />
              </div>
              <label htmlFor="email">Enter your Email</label>
              {/* <br /> */}
              <input
                type="text"
                name="email"
                className="p-2 rounded-md border-black/30 border-2"
                onChange={handleEmalChange}
                placeholder="Ex: example2001@gmail.com"
              />
              {emailErrors && <p className="error">{emailErrors}</p>}
              {/* {console.log("cls ", emailErrors)} */}
              <br />

              <div className="success mt-4 text-wrap text-center font-bold">
                {serverSideMsg.success && <p>{serverSideMsg.success}</p>}
              </div>

              <div className="error">
                {serverSideMsg.error && <p>{serverSideMsg.error}</p>}
              </div>

              <div className="">
                {console.log("error obj: ", serverSideMsg)}
              </div>

              <div className="buttons text-right grid grid-rows-2 gap-4 px-4">
                <button
                  className="mr-2 btn-back bg-blue-500 py-2 px-4 rounded-md w-full hover:text-white"
                  onClick={(e) => goBack(e)}
                >
                  Back
                </button>
                <button
                  className="frgBtn btn-reset bg-green-500 py-2 px-4 rounded-md w-full hover:text-white"
                  style={{ width: "auto" }}
                >
                  Reset password
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
