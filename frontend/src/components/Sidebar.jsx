import React from "react";
import AudioRecorder from "./AudioRecorder";
import "../styles/Sidebar.css";

const Sidebar = ({ setFields, onTranscriptionFinished }) => {
  return (
    <div className="sidebar">
      {/* Pass through both setFields and onTranscriptionFinished */}
      <AudioRecorder setFields={setFields} onTranscriptionFinished={onTranscriptionFinished} />
      <div className="sidebar-footer">© 2024 Your Company</div>
    </div>
  );
};

export default Sidebar;



