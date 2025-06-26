import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import "./styles/App.css";

const AppWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const mrn = queryParams.get("mrn") || "";
  const doctorId = queryParams.get("doctorId") || "";
  const caseNo = queryParams.get("caseNo") || "";
  const patientName = queryParams.get("patName") || "";

  const [fields, setFields] = useState({
    personalHistory: "",
    chiefComplaint: "",
    presentIllness: "",
    medicationHistory: "",
    pastHistory: "",
    familyHistory: "",
    requiredLabTestsAndProcedures: "",
  });

  return (
    <div className="app-container">
      <Navbar />
      <div className="content">
        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <FirstTimeVisit
                  fields={fields}
                  mrn={mrn}
                  doctorId={doctorId}
                  caseNo={caseNo}
                  patientName={patientName}
                />
              }
            />
            <Route path="/ai-second-opinion" element={<AISecondOpinion />} />
          </Routes>
        </div>
        <Sidebar
          setFields={setFields}
          fields={fields}
          mrn={mrn}
          doctorId={doctorId}
          caseNo={caseNo}
          patientName={patientName}
        />
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
