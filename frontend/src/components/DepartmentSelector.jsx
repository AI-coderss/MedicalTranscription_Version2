// components/DepartmentSelector.js
import React from "react";
import useDepartmentStore from "../store/useDepartmentStore";
import "../styles/DepartmentSelector.css";

const departments = [
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Oncology",
  "Dermatology",
  "ENT",
  "Gastroenterology",
  "Nephrology",
  "Ophthalmology",
  "Psychiatry",
  "Pulmonology",
  "Rheumatology",
  "Urology",
  "Endocrinology",
  "Hematology",
  "Gynecology",
  "Plastic Surgery",
  "General Surgery",
  "Infectious Diseases",
];

const DepartmentSelector = () => {
  const { selectedDepartment, setSelectedDepartment } = useDepartmentStore();

  const handleSelectionChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="department-selector">
      <label htmlFor="department-dropdown">Select Department:</label>
      <select
        id="department-dropdown"
        value={selectedDepartment}
        onChange={handleSelectionChange}
      >
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentSelector;
