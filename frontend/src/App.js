import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import FollowUpVisit from "./pages/FollowUpVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import "./styles/App.css";

const App = () => {
  // State to store extracted fields
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
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <div className="main-content">
            {/* Define routes for pages */}
            <Routes>
              <Route path="/" element={<FirstTimeVisit fields={fields} />} />
              <Route path="/follow-up" element={<FollowUpVisit />} />
              <Route path="/ai-second-opinion" element={<AISecondOpinion />} />
            </Routes>
          </div>
          {/* Pass setFields to Sidebar */}
          <Sidebar setFields={setFields} />
        </div>
      </div>
    </Router>
  );
};

export default App;



