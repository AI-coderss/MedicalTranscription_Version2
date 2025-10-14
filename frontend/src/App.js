import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import FirstTimeVisit from "./pages/FirstTimeVisit";
import AISecondOpinion from "./pages/AISecondOpinion";
import ClaimsReviewCard from "./components/ClaimsReviewCard";

import useTranscriptStore from "./store/useTranscriptStore"; // ⬅️ Zustand trigger source
import "./styles/App.css";

const App = () => {
  // UI fields for FirstTimeVisit
  const [fields, setFields] = useState({
    personalHistory: "",
    chiefComplaint: "",
    presentIllness: "",
    medicationHistory: "",
    pastHistory: "",
    familyHistory: "",
    requiredLabTestsAndProcedures: "",
  });

  // Claims Review overlay state
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");

  // Zustand transcript (set by AudioRecorder after transcription)
  const transcript = useTranscriptStore((s) => s.transcript);

  // If Sidebar (or anything) wants to explicitly open via callback/event
  const handleTranscriptionFinished = ({ transcript, fields: newFields }) => {
    if (newFields && typeof newFields === "object") {
      setFields((prev) => ({ ...prev, ...newFields }));
    }
    if (transcript) setFinalTranscript(transcript);
    setClaimsOpen(true);
  };

  // Auto-open the Claims Review when the transcript is set in Zustand
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      // open immediately; ClaimsReviewCard will refetch if fields update after
      setFinalTranscript(transcript);
      setClaimsOpen(true);
      console.info("[App] Claims Review triggered by Zustand transcript (len=%d)", transcript.length);
    }
  }, [transcript]);

  // Also support a global event fallback (belt & suspenders)
  useEffect(() => {
    const onDone = (e) => {
      const { transcript, fields: newFields } = e.detail || {};
      console.info("[App] Global dsah:transcriptionFinished received");
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

          {/* Pass setFields + optional explicit callback to Sidebar/AudioRecorder */}
          <Sidebar setFields={setFields} onTranscriptionFinished={handleTranscriptionFinished} />
        </div>

        {/* Claims Review overlay (payload comes from local state + Zustand transcript) */}
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






