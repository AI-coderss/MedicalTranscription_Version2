import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import ClaimsReviewCard from "./components/ClaimsReviewCard";

import useClaimsReviewStore from "./store/useClaimsReviewStore";
import "./styles/App.css";

const AppWrapper = () => {
  const [fields, setFields] = useState({
    personalHistory: "",
    chiefComplaint: "",
    presentIllness: "",
    medicationHistory: "",
    pastHistory: "",
    familyHistory: "",
    requiredLabTestsAndProcedures: "",
  });

  const open = useClaimsReviewStore((s) => s.open);
  const crTranscript = useClaimsReviewStore((s) => s.transcript);
  const crFields = useClaimsReviewStore((s) => s.fields);
  const openClaimsReview = useClaimsReviewStore((s) => s.openClaimsReview);
  const closeClaimsReview = useClaimsReviewStore((s) => s.closeClaimsReview);

  const handleTranscriptionFinished = ({ transcript, fields: newFields }) => {
    if (newFields && typeof newFields === "object") {
      setFields((prev) => ({ ...prev, ...newFields }));
    }
    openClaimsReview({ transcript, fields: newFields });
  };

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
    <div className="app-container">
      <Navbar />
      <div className="content">
        <div className="main-content">
          <Routes>
            <Route path="/" element={<FirstTimeVisit fields={fields} />} />
            <Route path="/ai-second-opinion" element={<AISecondOpinion />} />
          </Routes>
        </div>

        <Sidebar
          setFields={setFields}
          onTranscriptionFinished={handleTranscriptionFinished}
        />
      </div>

      {open && (
        <ClaimsReviewCard
          open={open}
          onClose={closeClaimsReview}
          transcript={crTranscript}
          fields={crFields}
        />
      )}
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;
