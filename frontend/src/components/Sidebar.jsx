import React from "react";
import AudioRecorder from "./AudioRecorder";
import "../styles/Sidebar.css";

const Sidebar = ({ setFields, fields, mrn, UserId, caseNo, patientName }) => {
  return (
    <div className="sidebar ">
      <AudioRecorder
        setFields={setFields}
        fields={fields}
        mrn={mrn}
        UserId={UserId}
        caseNo={caseNo}
        patientName={patientName}
      />
      <div className="sidebar-footer">© 2024 Your Company</div>
    </div>
  );
};

export default Sidebar;
