import React from "react";
import "../styles/FirstTimeVisit.css";

const FirstTimeVisit = ({
  fields,
  setFields,
  mrn,
  caseNo,
  patientName,
  UserId,
}) => {
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => alert("Copied to clipboard!"),
      (err) => console.error("Copy failed: ", err)
    );
  };

  return (
    <div className="first-time-visit">
      <div className="title-container">
        <h2>First Time Visit</h2>
        <img src="/img1.gif" alt="Decoration" className="title-gif" />
      </div>

      <div className="fields test">
        <div>
          <label>
            MRN:
            <br />
            <input type="text" value={mrn} readOnly />
          </label>
        </div>
        <div>
          <label>
            Case No:
            <br />
            <input type="text" value={caseNo} readOnly />
          </label>
        </div>
        <div>
          <label>
            Patient Name:
            <br />
            <input type="text" value={patientName} readOnly />
          </label>
        </div>
        <div>
          <label>
            User ID:
            <br />
            <input type="text" value={UserId} readOnly />
          </label>
        </div>
      </div>

      <div className="fields">
        {[
          { label: "Personal History", id: "personalHistory" },
          { label: "Chief Complaint", id: "chiefComplaint" },
          { label: "Present Illness", id: "presentIllness" },
          { label: "Medication History", id: "medicationHistory" },
          { label: "Past History", id: "pastHistory" },
          { label: "Family History", id: "familyHistory" },
        ].map(({ label, id }) => (
          <div className="field-group" key={id}>
            <label htmlFor={id}>{label}:</label>
            <div className="textarea-container">
              <textarea
                id={id}
                className="neumorphic-input"
                value={fields[id] || ""}
                onChange={handleChange}
              />
              <div
                className="copy-icon-container"
                onClick={() => copyToClipboard(fields[id] || "")}
              >
                <i className="fas fa-copy copy-icon"></i>
              </div>
            </div>
          </div>
        ))}

        <div
          className="field-group"
          style={{ width: "100%", marginTop: "10px" }}
        >
          <label htmlFor="requiredLabTestsAndProcedures">
            Required Lab Tests and Procedures:
          </label>
          <div className="textarea-container">
            <textarea
              id="requiredLabTestsAndProcedures"
              className="neumorphic-input"
              value={fields.requiredLabTestsAndProcedures || ""}
              onChange={handleChange}
            />
            <div
              className="copy-icon-container"
              onClick={() =>
                copyToClipboard(fields.requiredLabTestsAndProcedures || "")
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
