import React from "react";
import "../styles/FirstTimeVisit.css";

const FirstTimeVisit = ({ fields }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Copying to clipboard was successful!");
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="first-time-visit">
      <div className="title-container">
        <h2>First Time Visit</h2>
        <img src="/img1.gif" alt="Decoration" className="title-gif" />
      </div>
      <div className="fields">
        <div className="field-group">
          <label htmlFor="personal-history">Personal History:</label>
          <div className="textarea-container">
            <textarea
              id="personal-history"
              className="neumorphic-input"
              value={fields.personalHistory || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.personalHistory)}
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="chief-complaint">Chief Complaint:</label>
          <div className="textarea-container">
            <textarea
              id="chief-complaint"
              className="neumorphic-input"
              value={fields.chiefComplaint || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.chiefComplaint)}
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="present-illness">Present Illness:</label>
          <div className="textarea-container">
            <textarea
              id="present-illness"
              className="neumorphic-input"
              value={fields.presentIllness || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.presentIllness)}
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="medication-history">Medication History:</label>
          <div className="textarea-container">
            <textarea
              id="medication-history"
              className="neumorphic-input"
              value={fields.medicationHistory || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.medicationHistory)}
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="past-history">Past History:</label>
          <div className="textarea-container">
            <textarea
              id="past-history"
              className="neumorphic-input"
              value={fields.pastHistory || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.pastHistory)}
            >

              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="family-history">Family History:</label>
          <div className="textarea-container">
            <textarea
              id="family-history"
              className="neumorphic-input"
              value={fields.familyHistory || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() => copyToClipboard(fields.familyHistory)}
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="lab-tests">
            Required Lab Tests and Procedures:
          </label>
          <div className="textarea-container">
            <textarea
              id="lab-tests"
              className="neumorphic-input"
              value={fields.requiredLabTestsAndProcedures || ""}
              readOnly
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() =>
                copyToClipboard(fields.requiredLabTestsAndProcedures)
              }
            >
              <i className="fas fa-copy copy-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeVisit;



