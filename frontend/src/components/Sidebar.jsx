import React from "react";
import AudioRecorder from "./AudioRecorder";
import "../styles/Sidebar.css";

const Sidebar = ({ setFields, fields, mrn, doctorId, caseNo, patientName }) => {
  const handleTransfer = () => {
    const payload = {
      trasncript: {
        mrn,
        doctorId,
        caseNo,
        patientName,
        personalHistory: fields.personalHistory || "",
        presentIllness: fields.presentIllness || "",
        pastHistory: fields.pastHistory || "",
        chiefComplaint: fields.chiefComplaint || "",
        medicationHistory: fields.medicationHistory || "",
        familyHistory: fields.familyHistory || "",
      },
    };

    console.log("Transfer Payload:", JSON.stringify(payload, null, 2));
    alert("Data prepared for transfer! Check console.");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-transfer-btn w-full">
        <button
          className="transfer-button w-full mt-3.5 p-[14px_9px] text-[20px] border-l-[10px] border-[#747EF2] rounded-[12px_0_10px_0]"
          onClick={handleTransfer}
        >
          Transfer
        </button>
      </div>
      <AudioRecorder setFields={setFields} />

      <div className="sidebar-footer">© 2024 Your Company</div>
    </div>
  );
};

export default Sidebar;
