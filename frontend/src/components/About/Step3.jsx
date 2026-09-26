import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

export default function Step3() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();

  const [isNonVeg, setIsNonVeg] = useState(
    formData["Diet Type"] === "Non-Vegetarian"
  );

  const [isVeg, setIsVeg] = useState(
  formData["Diet Type"] === "Vegan" || formData["Diet Type"] === "Vegetarian" || formData["Diet Type"] === ""
);

  const [dietQuality, setDietQuality] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "Diet Type": formData["Diet Type"] || "",
      "Junk Food Frequency": formData["Junk Food Frequency"] || "",
      "Sugar Intake": formData["Sugar Intake"] || "",
      "Protein Intake": formData["Protein Intake"] || "",
      "Diet Quality": formData["Diet Quality"] || "",
    },
  });

  const sugar = watch("Sugar Intake");
  const protein = watch("Protein Intake");
  const junk = watch("Junk Food Frequency");

  useEffect(() => {
    if (!sugar || !protein || !junk) {
      setDietQuality("");
      return;
    }
    let score = 0;
    if (protein === "High") score += 2;
    else if (protein === "Low") score -= 2;
    if (junk === "Never") score += 2;
    else if (junk === "High") score -= 2;
    if (sugar === "Low") score += 2;
    else if (sugar === "High") score -= 2;
    if (score >= 3) setDietQuality("High");
    else if (score <= -3) setDietQuality("Low");
    else setDietQuality("Medium");
  }, [sugar, protein, junk]);

  const onSubmit = (data) => {
    let finalDietType = data["Diet Type"];
    if (data["Diet Type"] === "Non-Vegetarian") {
      if (data.meatFrequency === "Every Day") finalDietType = "Non-Vegetarian";
      else if (data.meatFrequency) finalDietType = "Mixed";
    }
    delete formData.meatFrequency;
    updateFormData({
      ...data,
      "Diet Type": finalDietType,
      "Diet Quality": dietQuality,
    });
    navigate("/About/step4");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden animate-fadeIn"
    >

      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow"></div>

      <h2 className="relative text-4xl font-extrabold text-center text-gray-800 mb-10 animate-fadeDown">
        Step 3 — Diet Info
      </h2>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Diet Type
          </label>
          <select
            {...register("Diet Type", {
              required: "Please select a valid choice",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            onChange={(e) => {
            const value = e.target.value;
            setIsNonVeg(value === "Non-Vegetarian");
            setIsVeg(value === "Vegan" || value === "Vegetarian" || value === "");
        }}
          >
            <option value="">Select...</option>
            <option value="Vegan">Vegan</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>
          {errors["Diet Type"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Diet Type"].message}
            </p>
          )}
        </div>

        {isNonVeg && (
          <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <label className="block text-emerald-700 font-semibold mb-1">
              How often do you eat meat?
            </label>
            <select
              {...register("meatFrequency", {
                required: "Please select a valid choice",
              })}
              className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            >
              <option value="">Select...</option>
              <option value="Every Day">Every Day</option>
              <option value="Mixed">Few Days a Week</option>
              <option value="Mixed">Occasionally</option>
            </select>
            {errors.meatFrequency && (
              <p className="text-red-500 text-sm mt-1">
                {errors.meatFrequency.message}
              </p>
            )}
          </div>
        )}

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Sugar Intake
          </label>
          <select
            {...register("Sugar Intake", {
              required: "Please select a valid choice",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors["Sugar Intake"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Sugar Intake"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Protein Intake
          </label>
          <select
            {...register("Protein Intake", {
              required: "Please select a valid choice",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors["Protein Intake"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Protein Intake"].message}
            </p>
          )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Junk Food Frequency
          </label>
          <select
            {...register("Junk Food Frequency", {
              required: "Please select a valid choice",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Never">Never</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          {errors["Junk Food Frequency"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Junk Food Frequency"].message}
            </p>
          )}
        </div>

        <div className={`group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${
    isVeg ? "col-span-2 flex justify-center items-center text-center" : ""
  }`}>
          <label className="block text-emerald-700 font-semibold mb-1">
            Diet Quality
          </label>
          <input
            type="text"
            {...register("Diet Quality")}
            value={dietQuality}
            readOnly
            className="w-full p-2 rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="Fill the above details first"
          />
          {errors["Diet Quality"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Diet Quality"].message}
            </p>
          )}
        </div>

      </div>

      <div className="relative flex justify-between items-center pt-8 animate-fadeInUp">
        <button
          type="button"
          onClick={() => navigate("/About/step2")}
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
