import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import ClaimsReviewCard from "./components/ClaimsReviewCard";

import useClaimsReviewStore from "./store/useClaimsReviewStore"; // ⬅️ NEW
import "./styles/App.css";

const App = () => {
  // Local fields for FirstTimeVisit page (kept as your UI state)
  const [fields, setFields] = useState({
    personalHistory: "",
    chiefComplaint: "",
    presentIllness: "",
    medicationHistory: "",
    pastHistory: "",
    familyHistory: "",
    requiredLabTestsAndProcedures: "",
  });

  // Zustand — single source of truth to open the Claims Review overlay
  const open = useClaimsReviewStore((s) => s.open);
  const crTranscript = useClaimsReviewStore((s) => s.transcript);
  const crFields = useClaimsReviewStore((s) => s.fields);
  const openClaimsReview = useClaimsReviewStore((s) => s.openClaimsReview);
  const closeClaimsReview = useClaimsReviewStore((s) => s.closeClaimsReview);

  // Optional callback path (besides direct store usage)
  const handleTranscriptionFinished = ({ transcript, fields: newFields }) => {
    if (newFields && typeof newFields === "object") {
      setFields((prev) => ({ ...prev, ...newFields }));
    }
    openClaimsReview({ transcript, fields: newFields });
  };

  // ALSO support the global event fallback
  useEffect(() => {
    const onDone = (e) => {
      const { transcript, fields: newFields } = e.detail || {};
      console.info("[App] Global transcriptionFinished event received");
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
            <Routes>
              <Route path="/" element={<FirstTimeVisit fields={fields} />} />
              <Route path="/ai-second-opinion" element={<AISecondOpinion />} />
            </Routes>
          </div>

          {/* Sidebar now receives the optional callback as well */}
          <Sidebar setFields={setFields} onTranscriptionFinished={handleTranscriptionFinished} />
        </div>

        {/* Claims Review overlay, driven by Zustand */}
        {open && (
          <ClaimsReviewCard
            open={open}
            onClose={closeClaimsReview}
            transcript={crTranscript}
            fields={crFields}
          />
        )}
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





