import React from "react";
import "../styles/FirstTimeVisit.css";

const FirstTimeVisit = ({ fields, mrn, doctorId, caseNo, patientName }) => {
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

      <div className="basic-info">
        <p>
          <strong>MRN:</strong> {mrn}
        </p>
        <p>
          <strong>Doctor ID:</strong> {doctorId}
        </p>
        <p>
          <strong>Case No:</strong> {caseNo}
        </p>
        <p>
          <strong>Patient Name:</strong> {patientName}
        </p>
      </div>

      <div className="fields">
        {[
          {
            label: "Personal History",
            id: "personal-history",
            value: fields.personalHistory,
          },
          {
            label: "Chief Complaint",
            id: "chief-complaint",
            value: fields.chiefComplaint,
          },
          {
            label: "Present Illness",
            id: "present-illness",
            value: fields.presentIllness,
          },
          {
            label: "Medication History",
            id: "medication-history",
            value: fields.medicationHistory,
          },
          {
            label: "Past History",
            id: "past-history",
            value: fields.pastHistory,
          },
          {
            label: "Family History",
            id: "family-history",
            value: fields.familyHistory,
          },
        ].map(({ label, id, value }) => (
          <div className="field-group" key={id}>
            <label htmlFor={id}>{label}:</label>
            <div className="textarea-container">
              <textarea
                id={id}
                className="neumorphic-input"
                value={value || ""}
                readOnly
              ></textarea>
              <div
                className="copy-icon-container"
                onClick={() => copyToClipboard(value)}
              >
                <i className="fas fa-copy copy-icon"></i>
              </div>
            </div>
          </div>
        ))}

        <div
          className="field-group"
          style={{ width: "100%", marginTop: "35px" }}
        >
          <label htmlFor="lab-tests">Required Lab Tests and Procedures:</label>
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
