import React from "react";
import AudioRecorder from "./AudioRecorder";
import "../styles/Sidebar.css";

const Sidebar = ({ setFields,fields, mrn, UserId, caseNo, patientName, onTranscriptionFinished }) => {
  return (
    <div className="sidebar">
      {/* Forward both props so AudioRecorder can populate fields and (optionally) call the callback */}
      <AudioRecorder 
      setFields={setFields} 
      onTranscriptionFinished={onTranscriptionFinished}
        fields={fields}
        mrn={mrn}
        UserId={UserId}
        caseNo={caseNo}
        patientName={patientName} />
      <div className="sidebar-footer">© 2024 Your Company</div>
    </div>
  );
};

export default Sidebar;



