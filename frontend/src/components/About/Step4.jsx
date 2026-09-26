import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

export default function Step4() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [sleepDuration, setSleepDuration] = useState(
    formData["Sleep Duration"] || ""
  );
  const [sleepQuality, setSleepQuality] = useState(
    formData["Sleep Quality"] || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Alcohol: formData.Alcohol || "",
      Smoking: formData.Smoking || "",
      "Sleep Duration": Number(formData["Sleep Duration"]) || "",
      "Sleep Quality": formData["Sleep Quality"] || "",
      "Daily Activity": Number(formData["Daily Activity"]) || "",
      "Exercise Type": formData["Exercise Type"] || "",
    },
  });

  useEffect(() => {
    const hours = parseFloat(sleepDuration);
    if (isNaN(hours)) {
      setSleepQuality("");
      return;
    }
    if (hours < 6.5 || hours > 9.5) setSleepQuality("Poor");
    else if ((hours >= 6.5 && hours < 7) || (hours > 9 && hours <= 9.5))
      setSleepQuality("Average");
    else if (hours >= 7 && hours <= 9) setSleepQuality("Good");
  }, [sleepDuration]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      "Sleep Quality": sleepQuality,
      "Sleep Duration": Number(data["Sleep Duration"]),
      "Daily Activity": Number(data["Daily Activity"]),
    };
    updateFormData(formattedData);
    console.log(formattedData);
    navigate("/About/step5");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden animate-fadeIn"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow"></div>

      <h2 className="relative text-4xl font-extrabold text-center text-gray-800 mb-10 animate-fadeDown">
        Step 4 — Lifestyle Info
      </h2>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Alcohol Frequency
          </label>
          <select
            {...register("Alcohol", { required: "Select alcohol consumption" })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Never">Never</option>
            <option value="Occasionally">Occasionally</option>
            <option value="Daily">Daily</option>
          </select>
          {errors.Alcohol && (
            <p className="text-red-500 text-sm mt-1">
              {errors.Alcohol.message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Smoking Frequency
          </label>
          <select
            {...register("Smoking", { required: "Select smoking frequency" })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Never">Never</option>
            <option value="Occasionally">Occasionally</option>
            <option value="Daily">Daily</option>
          </select>
          {errors.Smoking && (
            <p className="text-red-500 text-sm mt-1">
              {errors.Smoking.message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Sleep Duration (hours)
          </label>
          <input
            type="number"
            step="any"
            {...register("Sleep Duration", {
              required: "Sleep duration is required",
              min: { value: 0, message: "Must be at least 0" },
              max: { value: 16, message: "Must be 16 or less" },
            })}
            onChange={(e) => setSleepDuration(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="Enter your sleep hours"
          />
          {errors["Sleep Duration"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Sleep Duration"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Sleep Quality
          </label>
          <input
            type="text"
            {...register("Sleep Quality")}
            value={sleepQuality}
            readOnly
            className="w-full p-2 rounded-md bg-gray-100 text-gray-700 outline-none"
            placeholder="Auto-calculated based on duration"
          />
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Daily Activity (Steps)
          </label>
          <input
            type="number"
            {...register("Daily Activity", {
              required: "Step count is required",
              min: { value: 0, message: "Must be positive" },
              max: { value: 30000, message: "Max 30,000 steps" },
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="Enter average daily steps"
          />
          {errors["Daily Activity"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Daily Activity"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Exercise Type
          </label>
          <select
            {...register("Exercise Type", {
              required: "Select exercise type",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="None">None</option>
            <option value="Walking">Walking</option>
            <option value="Gym">Gym</option>
            <option value="Yoga">Yoga</option>
          </select>
          {errors["Exercise Type"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Exercise Type"].message}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex justify-between items-center pt-8 animate-fadeInUp">
        <button
          type="button"
          onClick={() => navigate("/About/step3")}
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
