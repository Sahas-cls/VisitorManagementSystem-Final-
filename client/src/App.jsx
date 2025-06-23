import React, { useState } from "react";
import Login from "./components/Login/Login";
import CMain from "./components/DeparmentClerk/CMain";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CReport from "./components/DeparmentClerk/CReport";
import RMain from "./components/Recept/RMain";
import SuddenVisit from "./components/Recept/SuddenVisit";
import Register from "./components/Login/Register";
import DMain from "./components/DepartmentHeader/DMain";
import HMain from "./components/HRDep/HMain";
import VisitorF from "./components/Visitor/VisitorF";
import CConteiner from "./components/DeparmentClerk/CConteiner";
import DContainer from "./components/DepartmentHeader/DContainer";
// import Header from "./components/Header";
import { PrivateRoute } from "./components/Middleware/PrivateRoute";
import ForgotPassword from "./components/Login/ForgotPassword";
import CDisplayVisitor from "./components/DeparmentClerk/CDisplayVisitor";
import DDisplayVisitor from "./components/DepartmentHeader/DDisplayVisitor";
import VisitorSuccess from "./components/Visitor/VisitorSuccess";
import HDisplayVisitor from "./components/HRDep/HDisplayVisitor";
import RDisaplayVisitor from "./components/Recept/RDisplayVisitor";
import Resetpassword from "./components/Login/Resetpassword";
import EditVisitor from "./components/Recept/EditVisitor";
import EditUser from "./components/Administrator/EditUser";
import SMain from "./components/SecurityOfficer/SMain";
import AMain from "./components/Administrator/AMain";
// import PopupBox from './components/Recept/popupBox';

function App() {
  document.title = "Visitor Management System";
  return (
    <div className="root-div">
      <Router>
        <Routes>
          {/* <Route path='' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path="/dashboard-clerk" element={<CMain />} />
          <Route path='/dashboard-d-head' element={<DMain />}></Route>
          <Route path='/report-clerk' element={<CReport />}></Route>
          <Route path='/dashboard-hr' element={<HMain />}></Route>
          <Route path='/dashboard-recept' element={<RMain />}></Route>
          <Route path='/sudden-visits' element={<SuddenVisit />}></Route>
          <Route path='/visitor-registration' element={<VisitorF />}></Route> */}
          {/* <PrivateRoute /> */}
          <Route path="" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new-visitor" element={<VisitorF />} />
          <Route path="/dashboard-clerk" element={<PrivateRoute />} />
          <Route path="/dashboard-d-head" element={<PrivateRoute />} />
          <Route path="/report-clerk" element={<PrivateRoute />} />
          <Route path="/dashboard-hr" element={<PrivateRoute />} />
          <Route path="/dashboard-recept" element={<PrivateRoute />} />
          <Route path="/dashboard-administrator" element={<PrivateRoute />} />
          <Route
            path="/dashboard-security-officer"
            element={<PrivateRoute />}
          />
          <Route path="/edit-users" element={<EditUser />} />
          <Route path="/editVisitor" element={<CDisplayVisitor />} />
          <Route path="/approve-dhead" element={<DDisplayVisitor />} />
          <Route path="/sudden-visits" element={<PrivateRoute />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/visitor-success" element={<VisitorSuccess />} />
          <Route path="/editVisitor-HR" element={<HDisplayVisitor />} />
          {/* to display specific user in reception's dashboard */}
          <Route path="/approve-reception" element={<RDisaplayVisitor />} />
          {/* route to reset user password */}
          <Route path="/reset-user-password" element={<Resetpassword />} />
          {/* to edit visitors details - reception */}
          <Route path="/edit-visit-recept" element={<EditVisitor />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
