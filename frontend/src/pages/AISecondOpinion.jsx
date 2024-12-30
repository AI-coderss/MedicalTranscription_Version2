import React, { useState } from "react";
import axios from "axios";
import useTranscriptStore from "../store/useTranscriptStore"; // Zustand store for managing transcript
import "../styles/AISecondOpinion.css"; // Custom styles

const AISecondOpinion = () => {
  const transcript = useTranscriptStore((state) => state.transcript);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to send transcript to Flask endpoint
  const sendTranscriptToFlask = async () => {
    console.log("Transcript:", transcript);
    if (!transcript) {
      alert("No transcript available to send.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8502/process-transcript", // Use Flask endpoint here
        { transcript },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Required for CORS with credentials
        }
      );

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
              src="http://localhost:8501/?embed=true" // Embed the Streamlit app
              style={{
                width: "100%",
                height: "700px",
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



















