import React, { useEffect, useState } from "react";
import axios from "axios";
import useTranscriptStore from "../store/useTranscriptStore"; // Import the Zustand store
import { jsPDF } from "jspdf";
import "../styles/AISecondOpinion.css";

const AISecondOpinion = () => {
  const transcript = useTranscriptStore((state) => state.transcript); // Zustand getter
  const [analysisResult, setAnalysisResult] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!transcript) {
        setError("No transcript provided.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post("http://localhost:5000/api/generate", {
          input: transcript,
        });

        console.log("API Response:", response.data);
        if (response.data.response) {
          setAnalysisResult(response.data.response);
        } else {
          setError("No response from AI.");
        }
      } catch (err) {
        console.error("Error fetching AI second opinion:", err);
        setError("An error occurred while analyzing the case.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [transcript]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => console.error("Failed to copy text: ", err)
    );
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(analysisResult, 14, 14);
    doc.save("AI_Second_Opinion.pdf");
  };

  return (
    <div className="ai-second-opinion-page">
      <div className="title-container">
        <h2>AI Second Opinion</h2>
        <img src="/img4.gif" alt="Loading GIF" className="title-gif" />
      </div>
      <div className="ai-second-opinion-content">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <pre className="analysis-result">{error}</pre>
        ) : (
          <div className="analysis-result-container">
            <pre
              className="analysis-result"
              dangerouslySetInnerHTML={{ __html: analysisResult }}
            ></pre>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(analysisResult)}
            >
              <span className="copy-label">Copy</span>
              <i className="fas fa-copy copy-icon"></i>
            </div>
            <button onClick={downloadPDF}>Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISecondOpinion;












