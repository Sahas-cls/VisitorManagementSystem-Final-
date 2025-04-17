import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import axios from "axios";
import Swal from "sweetalert2";
// import React from "react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [emailErrors, setEmailErrors] = useState();
  const [serverSideMsg, setServerSideMsg] = useState({});

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
          "http://localhost:3000/user/forgot-password",
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
    <div className="forgotPassword-div">
      <form onSubmit={handleSubmit}>
        <div className="sub-div">
          <div className="form-div">
            <h1 className="forgot-title">Forgot Password?</h1>
            <label htmlFor="email">Enter your Email</label>
            <br />
            <input
              type="text"
              name="email"
              className=""
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

            <div className="">{console.log("error obj: ", serverSideMsg)}</div>

            <div className="buttons text-right">
              <button className="mr-2 btn-back" onClick={(e) => goBack(e)}>
                Back
              </button>
              <button className="frgBtn btn-reset" style={{ width: "auto" }}>
                Reset password
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
