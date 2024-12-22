import React from "react";
import "../styles/FirstTimeVisit.css";

const FirstTimeVisit = ({ fields }) => {
  return (
    <div className="first-time-visit">
      <h2>First Time Visit</h2>
      <div className="fields">
        <div className="field-group">
          <label htmlFor="personal-history">Personal History:</label>
          <textarea
            id="personal-history"
            className="neumorphic-input"
            value={fields.personalHistory || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="chief-complaint">Chief Complaint:</label>
          <textarea
            id="chief-complaint"
            className="neumorphic-input"
            value={fields.chiefComplaint || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="present-illness">Present Illness:</label>
          <textarea
            id="present-illness"
            className="neumorphic-input"
            value={fields.presentIllness || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="medication-history">Medication History:</label>
          <textarea
            id="medication-history"
            className="neumorphic-input"
            value={fields.medicationHistory || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="past-history">Past History:</label>
          <textarea
            id="past-history"
            className="neumorphic-input"
            value={fields.pastHistory || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="family-history">Family History:</label>
          <textarea
            id="family-history"
            className="neumorphic-input"
            value={fields.familyHistory || ""}
            readOnly
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="lab-tests">
            Required Lab Tests and Procedures:
          </label>
          <textarea
            id="lab-tests"
            className="neumorphic-input"
            value={fields.requiredLabTestsAndProcedures || ""}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeVisit;


