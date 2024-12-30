import React, { useState } from "react";
import "../styles/FollowUpVisit.css";

const FollowUpVisit = () => {
  // List of departments and their relevant questions
  const departments = {
    "General Medicine": [
      "How have your symptoms changed since your last visit?",
      "Have you experienced any new symptoms?",
      "How are you tolerating your current medications?",
      "Have there been any changes in your medical history?",
      "Are there any side effects from your treatment?",
      "Do you have any concerns about your recovery?",
    ],
    Cardiology: [
      "Have you experienced any chest pain or discomfort?",
      "How is your breathing during physical activity?",
      "Have you noticed any swelling in your legs or ankles?",
      "Are you adhering to your prescribed medications?",
      "Do you monitor your blood pressure regularly?",
      "Have there been any episodes of dizziness or fainting?",
    ],
    Neurology: [
      "Have you experienced any headaches or migraines?",
      "How is your coordination and balance?",
      "Have there been any changes in memory or concentration?",
      "Have you had any seizures or unusual sensations?",
      "Are there any issues with muscle weakness or numbness?",
      "How are your current medications affecting you?",
    ],
    // Other departments here...
  };

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [answers, setAnswers] = useState({});

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);
    setAnswers({}); // Reset answers when department changes
  };

  const handleInputChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  return (
    <div className="follow-up-visit">
      <h1>Follow-Up Visit</h1>
      <div className="department-selection">
        <label htmlFor="department">Select Department:</label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
        >
          <option value="">-- Select a Department --</option>
          {Object.keys(departments).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>
      {selectedDepartment && (
        <div className="questions-container">
          {departments[selectedDepartment].map((question, index) => (
            <div key={index} className="question-field">
              <label htmlFor={`question-${index}`}>{question}</label>
              <textarea
                id={`question-${index}`}
                value={answers[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="Enter your answer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowUpVisit;

