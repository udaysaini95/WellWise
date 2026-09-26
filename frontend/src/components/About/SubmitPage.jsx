import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

export default function SubmitPage() {
  const { formData } = useFormContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final data object:", formData);
    navigate("/result");
  };

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    return value || "—";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-6xl mx-auto space-y-10 px-8 py-12 bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20  animate-pulseSlow"></div>

      <h2 className="relative text-5xl font-extrabold text-center text-gray-800 tracking-tight animate-fadeDown drop-shadow-sm">
        Step 3 — Review & Submit
      </h2>

      <div className="relative bg-white/80 p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-500 animate-scaleIn">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-5 text-gray-700 text-[15px] leading-relaxed">
          {[
            ["Age", Number(formData.Age) || "—"],
            ["Height", Number(formData.Height) || "—"],
            ["Diet Type", formatValue(formData["Diet Type"])],
            ["Gender", formatValue(formData.Gender)],
            ["Weight", Number(formData.Weight) || "—"],
            ["Alcohol", formatValue(formData.Alcohol)],
            ["Ethnicity", formatValue(formData.Ethnicity)],
            ["BMI", Number(formData.BMI) || "—"],
            [
              "Junk Food Frequency",
              formatValue(formData["Junk Food Frequency"]),
            ],
            ["State", formatValue(formData.State)],
            [
              "Resting Heart Rate",
              Number(formData["Resting Heart Rate"]) || "—",
            ],
            ["Sugar Intake", formatValue(formData["Sugar Intake"])],
            ["City", formatValue(formData.City)],
            ["Blood Pressure", formatValue(formData["Blood Pressure"])],
            ["Protein Intake", formatValue(formData["Protein Intake"])],
            ["Area", formatValue(formData["Urban/Rural"])],
            ["SpO2", Number(formData.SpO2) || "—"],
            ["Diet Quality", formatValue(formData["Diet Quality"])],
            ["Smoking", formatValue(formData.Smoking)],
            ["Sleep Duration", Number(formData["Sleep Duration"]) || "—"],
            ["Air Quality Index", formatValue(formData["Air Quality Index"])],
            ["Sleep Quality", formatValue(formData["Sleep Quality"])],
            ["Daily Activity", Number(formData["Daily Activity"]) || "—"],
            ["Work Hours", Number(formData["Work Hours"]) || "—"],
            ["Exercise Type", formatValue(formData["Exercise Type"])],
            [
              "Existing Conditions",
              formatValue(formData["Existing Conditions"]),
            ],
            ["Family History", formatValue(formData["Family History"])],
            ["Stress Score", Number(formData["Stress Score"]) || "—"],
            ["Exposure", formatValue(formData.Exposure)],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200/70 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <p className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-900 transition">
                {label}:
              </p>
              <p className="text-gray-800 mt-1 group-hover:text-gray-900 transition">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex justify-between items-center pt-6 animate-fadeInUp">
        <button
          type="button"
          onClick={() => navigate("/About/step5")}
          className="py-2.5 px-8 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          ← Back
        </button>

        <button
          type="submit"
          className="py-2.5 px-8 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-400/40 transition-all duration-500 hover:scale-110"
        >
          Submit ✓
        </button>
      </div>
    </form>
  );
}
