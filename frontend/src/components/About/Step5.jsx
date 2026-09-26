import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

import { LocationAutoFill } from "./AQI/AQI";

export default function Step5() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();

  const [isLocation, setIsLocation] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [aqi, setAQI] = useState({ overallAQI: 0 });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "Air Quality Index": formData["Air Quality Index"] || "",
      "Work Hours": Number(formData["Work Hours"]) || "",
      "Existing Conditions": formData["Existing Conditions"] || [],
      "Family History": formData["Family History"] || [],
      "Stress Score": Number(formData["Stress Score"]) || "",
      Exposure: formData.Exposure || "",
    },
  });

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      "Work Hours": Number(data["Work Hours"]),
      "Stress Score": Number(data["Stress Score"]),
    };
    updateFormData(formattedData);
    console.log(formattedData);
    navigate("/About/Submit");
  };

  const handleChange = async (e) => {
    const checked = e.target.checked;
    setIsLocation(checked);

    if (checked) {
      setIsDisabled(true);
      try {
        const aqiValue = await LocationAutoFill();
        setAQI(aqiValue);
        setValue("Air Quality Index", aqiValue.overallAQI);
        updateFormData({
          ...formData,
          "Air Quality Index": aqiValue.overallAQI,
        });
      } catch (err) {
        console.error("Error getting location:", err);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden animate-fadeIn"
    >

      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow"></div>

      <h2 className="relative text-4xl font-extrabold text-center text-gray-800 mb-10 animate-fadeDown">
        Step 5 — Environmental & Condition Info
      </h2>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Work Hours (per day)
          </label>
          <input
            type="number"
            step="any"
            {...register("Work Hours", {
              required: "Work hours are required",
              min: { value: 0, message: "Enter a valid value (0–24)" },
              max: { value: 24, message: "Enter a valid value (0–24)" },
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="e.g., 8"
          />
          {errors["Work Hours"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Work Hours"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative">
  <label className="block text-emerald-700 font-semibold mb-1 flex items-center gap-2">
    Stress Score (1–10)

    {/* Tooltip Icon */}
    <div className="relative group/tooltip">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 text-emerald-600 cursor-pointer hover:text-emerald-800 transition"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6m0 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Tooltip Content */}
      <div className="absolute z-10 w-64 p-3 text-xs text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 -translate-y-2 transition-all duration-300 left-1/2 -translate-x-1/2 top-7 pointer-events-none">
        <strong className="block mb-1 text-emerald-300">
          Stress Score Reference
        </strong>
        <ul className="space-y-1">
          <li><b>1–2:</b> Very Calm / Relaxed</li>
          <li><b>3–4:</b> Mild Stress, manageable</li>
          <li><b>5–6:</b> Moderate Stress, take short breaks</li>
          <li><b>7–8:</b> High Stress, needs rest or relaxation</li>
          <li><b>9–10:</b> Severe Stress, seek recovery or help</li>
        </ul>
      </div>
    </div>
    </label>

        <input
          type="number"
          {...register("Stress Score", {
            required: "Stress score is required",
            min: { value: 1, message: "Minimum is 1" },
            max: { value: 10, message: "Maximum is 10" },
          })}
          className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          placeholder="Enter a value between 1 and 10"
        />

        {errors["Stress Score"] && (
          <p className="text-red-500 text-sm mt-1">
            {errors["Stress Score"].message}
          </p>
        )}
      </div>

        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 sm:col-span-2">
          <label className="block text-emerald-700 font-semibold mb-1">
            Air Quality Index (AQI)
          </label>
          <input
            type="text"
            {...register("Air Quality Index", {
              required: "Location access required",
            })}
            className="w-full p-2 rounded-md bg-gray-100 outline-none"
            value={aqi.overallAQI || (isLocation ? "Fetching..." : 0)}
            readOnly
          />
          {errors["Air Quality Index"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Air Quality Index"].message}
            </p>
          )}
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="checkbox"
              onChange={handleChange}
              disabled={isDisabled}
              className="h-5 w-5 cursor-pointer rounded border border-gray-400 checked:bg-emerald-600 checked:border-emerald-600"
            />
            <label className="font-medium text-gray-700">Access Location</label>
          </div>
        </div>

        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            How often you interact with outside
          </label>
          <select
            {...register("Exposure", { required: "Select a valid option" })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Low">Indoors</option>
            <option value="Medium">Ocassionally</option>
            <option value="High">Outdoors</option>
          </select>
          {errors["Exposure"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Exposure"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Family History
          </label>
          <div className="space-y-2">
            {[
              {
                name: "Diabetes",
                desc: "A chronic condition that affects how your body turns food into energy.",
              },
              {
                name: "Heart Disease",
                desc: "Includes conditions that affect heart function and blood flow.",
              },
              {
                name: "Cancer",
                desc: "Abnormal cell growth that can invade or spread to other parts of the body.",
              },
            ].map((disease) => (
              <label
                key={disease.name}
                className="relative flex items-center space-x-2 cursor-pointer group/tooltip"
              >
                <input
                  type="checkbox"
                  value={disease.name}
                  {...register("Family History")}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <span>{disease.name}</span>

                <span className="absolute left-35 top-0 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 -translate-y-1 pointer-events-none transition-all duration-300">
                  {disease.desc}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Existing Conditions
          </label>
          <div className="space-y-2">
            {[
              {
                name: "Hypertension",
                desc: "High blood pressure that can increase risk of heart and kidney disease.",
              },
              {
                name: "Asthma",
                desc: "A condition that inflames and narrows the airways, causing breathing difficulty.",
              },
              {
                name: "COPD",
                desc: "Chronic Obstructive Pulmonary Disease that affects lung airflow and breathing.",
              },
            ].map((condition) => (
              <label
                key={condition.name}
                className="relative flex items-center space-x-2 cursor-pointer group/tooltip"
              >
                <input
                  type="checkbox"
                  value={condition.name}
                  {...register("Existing Conditions")}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <span>{condition.name}</span>

                <span className="absolute left-35 top-0 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 -translate-y-1 pointer-events-none transition-all duration-300">
                  {condition.desc}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex justify-between items-center pt-8 animate-fadeInUp">
        <button
          type="button"
          onClick={() => navigate("/About/step4")}
          className="py-2.5 px-8 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="py-2.5 px-8 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-400/40 transition-all duration-500 hover:scale-110"
        >
          Next →
        </button>
      </div>
    </form>
  );
}
