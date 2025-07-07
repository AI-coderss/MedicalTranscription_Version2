import React, { useState, useEffect } from "react";
import "../styles/FirstTimeVisit.css";

const FirstTimeVisit = ({
  fields,
  mrn,
  doctorId,
  caseNo,
  patientName,
  UserId,
}) => {
  const [formData, setFormData] = useState({
    personalHistory: "",
    chiefComplaint: "",
    presentIllness: "",
    medicationHistory: "",
    pastHistory: "",
    familyHistory: "",
    requiredLabTestsAndProcedures: "",
  });

  // ✅ Update state when props.fields changes
  useEffect(() => {
    if (fields) {
      setFormData({
        personalHistory: fields.personalHistory || "",
        chiefComplaint: fields.chiefComplaint || "",
        presentIllness: fields.presentIllness || "",
        medicationHistory: fields.medicationHistory || "",
        pastHistory: fields.pastHistory || "",
        familyHistory: fields.familyHistory || "",
        requiredLabTestsAndProcedures:
          fields.requiredLabTestsAndProcedures || "",
      });
    }
  }, [fields]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
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
            <br></br>
            <input type="text" value={mrn} />
          </label>
        </div>
        <div>
          <label>
            Doctor ID:
            <br></br>
            <input type="text" value={doctorId} />
          </label>
        </div>
        <div>
          <label>
            Case No:
            <br></br>
            <input type="text" value={caseNo} />
          </label>
        </div>
        <div>
          <label>
            Patient Name:
            <br></br>
            <input type="text" value={patientName} />
          </label>
        </div>
        <div>
          <label>
            User Id:
            <br></br>
            <input type="text" value={UserId} />
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
                value={formData[id]}
                onChange={handleChange}
              ></textarea>
              <div
                className="copy-icon-container"
                onClick={() => copyToClipboard(formData[id])}
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
              value={formData.requiredLabTestsAndProcedures}
              onChange={handleChange}
            ></textarea>
            <div
              className="copy-icon-container"
              onClick={() =>
                copyToClipboard(formData.requiredLabTestsAndProcedures)
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
