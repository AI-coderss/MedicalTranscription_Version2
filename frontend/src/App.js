import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import ClaimsReviewCard from "./components/ClaimsReviewCard"; 
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

  // These are for the Claims Review pop-up
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");

  // Optional: Sidebar can call this when the transcript is finished
  const handleTranscriptionFinished = ({ transcript, fields: newFields }) => {
    if (newFields && typeof newFields === "object") {
      setFields((prev) => ({ ...prev, ...newFields }));
    }
    if (transcript) setFinalTranscript(transcript);
    setClaimsOpen(true);
  };

  // ALSO support a global app-level event so you don't have to modify Sidebar if you don't want to.
  // Usage from anywhere (e.g. your Sidebar after finishing transcription):
  // window.dispatchEvent(new CustomEvent('dsah:transcriptionFinished', { detail: { transcript, fields } }));
  useEffect(() => {
    const onDone = (e) => {
      const { transcript, fields: newFields } = e.detail || {};
      handleTranscriptionFinished({ transcript, fields: newFields });
    };
    window.addEventListener("dsah:transcriptionFinished", onDone);
    return () => window.removeEventListener("dsah:transcriptionFinished", onDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <div className="main-content">
            {/* Define routes for pages */}
            <Routes>
              <Route path="/" element={<FirstTimeVisit fields={fields} />} />
              <Route path="/ai-second-opinion" element={<AISecondOpinion />} />
            </Routes>
          </div>

          {/* Pass setFields and an optional callback for transcription finish */}
          <Sidebar setFields={setFields} onTranscriptionFinished={handleTranscriptionFinished} />
        </div>

        {/* Claims Review overlay (conditionally rendered) */}
        {claimsOpen && (
          <ClaimsReviewCard
            open={claimsOpen}
            onClose={() => setClaimsOpen(false)}
            transcript={finalTranscript}
            fields={fields}
          />
        )}
      </div>
    </Router>
  );
};

export default App;




