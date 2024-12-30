import React, { useState } from "react";
import axios from "axios";
import useTranscriptStore from "../store/useTranscriptStore"; // Zustand store
import "../styles/AISecondOpinion.css";

const AISecondOpinion = () => {
  const transcript = useTranscriptStore((state) => state.transcript); // Zustand getter
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to send transcript to Flask endpoint
  const sendTranscriptToFlask = async () => {
    if (!transcript) {
      alert("No transcript available to send.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/process-transcript", {
        transcript,
      });

      if (response.status === 200) {
        alert("Transcript sent successfully to Streamlit app!");
      } else {
        setError("Failed to send the transcript.");
      }
    } catch (err) {
      console.error("Error sending transcript:", err);
      setError("An error occurred while sending the transcript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-second-opinion-page">
      <div className="title-container">
        <h2>AI Second Opinion</h2>
        <img src="/img4.gif" alt="Loading GIF" className="title-gif" />
      </div>

      <div className="ai-second-opinion-content">
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p>Sending transcript...</p>
        ) : (
          <>
            <button
              className="send-transcript-button"
              onClick={sendTranscriptToFlask}
              disabled={!transcript}
            >
              Send Transcript to Streamlit App
            </button>
            <iframe
              src="http://localhost:8501/?embed=true"
              style={{
                width: "100%",
                height: "600px",
                border: "none",
                marginTop: "20px",
              }}
              title="Embedded Streamlit App"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AISecondOpinion;














