// src/context/FormContext.jsx
import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const initialValues = {
    Age: "28",
    Gender: "Male",
    Ethnicity: "North Indian",
    Height: "175",
    Weight: "70",
    BMI: "22.86",
    "Blood Pressure": "120/80",
    "Resting Heart Rate": "72",
    SpO2: "98",
    "Diet Type": "Vegetarian",
    "Protein Intake": "Medium",
    "Junk Food Frequency": "Occasionally",
    "Sugar Intake": "Moderate",
    "Diet Quality": "High",
    Smoking: "Never",
    Alcohol: "Never",
    "Sleep Duration": "7",
    "Sleep Quality": "Good",
    "Daily Activity": "6",
    "Exercise Type": "Cardio",
    "Work Hours": "8",
    "Existing Conditions": [],
    "Family History": [],
    "Stress Score": "3",
    "Air Quality Index": "85",
    Exposure: "Moderate",
    "Urban/Rural": "Urban",
    urbanRural: "Urban",
    State: "Delhi",
    City: "Delhi",
  };

  const [formData, setFormData] = useState(initialValues);

  const updateFormData = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
  };

  const resetForm = () => {
    setFormData(initialValues);
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetForm }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
