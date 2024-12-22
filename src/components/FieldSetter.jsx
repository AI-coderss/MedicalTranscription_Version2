import React, { useState } from "react";
import AudioRecorder from "./AudioRecorder";
import FirstTimeVisit from "./FirstTimeVisit";


const FieldSetter = () => {
  const [fields, setFields] = useState({}); // State to hold extracted fields

  return (
    <div className="field-setter">
      <div className="field-setter-container">
        <AudioRecorder setFields={setFields} /> {/* Pass setFields to update fields */}
        <FirstTimeVisit fields={fields} /> {/* Pass fields to display data */}
      </div>
    </div>
  );
};

export default FieldSetter;
