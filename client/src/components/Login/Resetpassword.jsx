import React, { useEffect, useState } from "react";
import "./Resetpassword.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Resetpassword = () => {
  const [formData, setFormData] = useState();
  const [csrfToken, setCsrfToken] = useState();
  const [serverSideErrors, setServerSideErrors] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get("http://localhost:3000/getCSRFToken", {
          withCredentials: true,
        });
        if (response) {
          // alert(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          //   console.log(csrf);
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=================================");
    console.log(formData);
    try {
      alert("sending post request");
      const response = await axios.post(
        "http://localhost:3000/user/reset-password",
        formData,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log("response- ", response);

      if (response.status === 200) {
        setServerSideErrors("");
        // alert("password update success");
        setSuccessMessage({ success: "Your password reset success" });
      }
      //   setServerSideErrors(response.data.errors);
    } catch (error) {
      setSuccessMessage("");
      alert("error occured");
      alert(error.response.status);
      if (error.response.status === 400) {
        // alert(error.response.data.error);
        setServerSideErrors(
          error.response.data.errors || error.response.data.error
        );
        // console.log("asdfasdf " + serverSideErrors);
      } else if (error.response.status === 404) {
        setServerSideErrors(error.response.data.errors);
      }
      console.log(error);
    }
  };

  const navigate = useNavigate();

  const goBack = (e) => {
    e.preventDefault();
    // alert("prevented default");
    navigate(-1);
  };

  return (
    <div className="rs-main-div">
      <form onSubmit={handleSubmit}>
        <div className="rs-sub-div">
          <h1>Reset your password</h1>
          {/* row 1 */}
          <div className="rs-row">
            <div className="rs-col">
              <label htmlFor="token">Token: </label>
            </div>

            <div className="rs-col">
              <input
                type="text"
                name="token"
                id="token"
                className="rs-input"
                onChange={handleChanges}
              />
              <p className="text-red-600 text-left">
                {Array.isArray(serverSideErrors) &&
                  serverSideErrors.length > 0 &&
                  serverSideErrors
                    .filter((error) => error.path === "token") // Filter errors for the 'token' field
                    .map((error, index) => (
                      <span key={index}>{error.msg}</span> // Render the error message
                    ))}
              </p>
            </div>
          </div>

          {/* row 2 */}
          <div className="rs-row">
            <div className="rs-col">
              <label htmlFor="password">New Password:</label>
            </div>

            <div className="rs-col">
              <input
                type="password"
                name="password"
                id="password"
                className="rs-input"
                onChange={handleChanges}
              />
              <p className="text-red-600 text-left">
                {Array.isArray(serverSideErrors) &&
                  serverSideErrors.length > 0 &&
                  serverSideErrors
                    .filter((error) => error.path === "password") // Filter errors for the 'token' field
                    .map((error, index) => (
                      <span key={index}>{error.msg}</span> // Render the error message
                    ))}
              </p>
            </div>
          </div>

          {/* row 3 */}
          <div className="rs-row">
            <div className="rs-col">
              <label htmlFor="cpassword">Confirm Password:</label>
            </div>

            <div className="rs-col">
              <input
                id="cpassword"
                name="cpassword"
                type="password"
                className="rs-input"
                onChange={handleChanges}
              />
              <p className="text-red-600 text-left">
                {Array.isArray(serverSideErrors) &&
                  serverSideErrors.length > 0 &&
                  serverSideErrors
                    .filter((error) => error.path === "cpassword") // Filter errors for the 'token' field
                    .map((error, index) => (
                      <span key={index}>{error.msg}</span> // Render the error message
                    ))}
              </p>
            </div>
          </div>

          <div className="success text-center font-bold">
            {successMessage && successMessage.success && successMessage.success}
          </div>

          <div className="error text-center mb-3 font-bold">
            {Array.isArray(serverSideErrors) ? (
              serverSideErrors.map((error, index) => (
                <p key={index}></p> //no need to render validation error here
              ))
            ) : (
              <p>{serverSideErrors}</p>
            )}
          </div>
          <p>&nbsp;</p>
          <div className="mt-3 rs-buttons text-right">
            <button className="rs-button rs-back" onClick={goBack}>
              Back
            </button>
            <button className="rs-button rs-submit">Submit</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Resetpassword;
