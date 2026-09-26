import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

export default function Step2() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();

  const [height, setHeight] = useState(Number(formData.Height) || 175);
  const [weight, setWeight] = useState(Number(formData.Weight) || 70);
  const [bmi, setBMI] = useState(formData.BMI || ((70 / (175 * 175)) * 10000).toFixed(1));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Height: Number(formData.Height) || "",
      Weight: Number(formData.Weight) || "",
      BMI: Number(formData.BMI) || "",
      "Resting Heart Rate": Number(formData["Resting Heart Rate"]) || "",
      "Blood Pressure": formData["Blood Pressure"] || "",
      SpO2: Number(formData.SpO2) || "",
    },
  });

  useEffect(() => {
    if (weight < 30 || weight > 200 || height < 100 || height > 250) {
      setBMI(0);
      return;
    }
    const bmiValue = (weight / (height * height)) * 10000;
    const roundedBMI = bmiValue.toFixed(1);
    setBMI(roundedBMI);
  }, [height, weight]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      Height: Number(data.Height),
      Weight: Number(data.Weight),
      "Resting Heart Rate": Number(data["Resting Heart Rate"]),
      SpO2: Number(data.SpO2),
      BMI: Number(bmi),
    };
    updateFormData(formattedData);
    console.log(formattedData);
    navigate("/About/step3");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-visible animate-fadeIn"
    >
      
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow"></div>

      
      <h2 className="relative text-4xl font-extrabold text-center text-gray-800 mb-8 animate-fadeDown">
        Step 2 — Health Info
      </h2>

      
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        
        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Height (in cm)
          </label>
          <input
            type="number"
            {...register("Height", {
              required: "Height is required",
              min: { value: 100, message: "Please enter a valid height" },
              max: { value: 250, message: "Please enter a valid height" },
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="Enter your height"
          />
          {errors.Height && (
            <p className="text-red-500 text-sm mt-1">{errors.Height.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Weight (in Kg)
          </label>
          <input
            type="number"
            {...register("Weight", {
              required: "Weight is required",
              min: { value: 30, message: "Please enter a valid weight" },
              max: { value: 400, message: "Please enter a valid weight" },
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="Enter your weight"
          />
          {errors.Weight && (
            <p className="text-red-500 text-sm mt-1">{errors.Weight.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            BMI
            <span>
                ⓘ
                <span className="absolute left-20 top-1 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-[9999]">
                BMI (Body Mass Index) is a measure of body fat based on height and
                weight. A BMI between 18.5 and 24.9 is considered healthy.
            </span>
            </span>
          </label>
          <input
            type="number"
            {...register("BMI")}
            value={bmi}
            readOnly
            className="w-full p-2 rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="BMI will be calculated"
          />
        </div>

       
        
        <div className="group relative bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="text-emerald-700 font-semibold mb-1  items-center gap-2">
            SpO<sub>2</sub> (%)
            
            <span className="relative cursor-pointer text-emerald-600 font-bold text-sm group-hover:text-emerald-800 transition">
              ⓘ
              <span className="absolute left-6 top-0 w-56 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-2 pointer-events-none transition-all duration-300">
                SpO₂ (oxygen saturation) indicates how much oxygen your red
                blood cells are carrying compared to their maximum capacity.
              </span>
            </span>
          </label>

          <input
            type="number"
            {...register("SpO2", {
              required: "SpO₂ is required",
              min: { value: 90, message: "Please enter a valid value" },
              max: { value: 100, message: "Please enter a valid value" },
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="Measure using a pulse oximeter"
          />
          {errors.SpO2 && (
            <p className="text-red-500 text-sm mt-1">{errors.SpO2.message}</p>
          )}
        </div>

        
        <div className="group relative isolate overflow-visible bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <label className="text-emerald-700 font-semibold mb-1">
                Resting Heart Rate (bpm)
                </label>
            </div>

            <input
                type="number"
                {...register("Resting Heart Rate", {
                required: "Resting Heart Rate is required",
                min: { value: 40, message: "Please enter a valid value" },
                max: { value: 110, message: "Please enter a valid value" },
                })}
                className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
                placeholder="Enter your resting heart rate"
            />

            {errors["Resting Heart Rate"] && (
                <p className="text-red-500 text-sm mt-1">
                {errors["Resting Heart Rate"].message}
                </p>
            )}
        </div>

        <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Average Blood Pressure (mmHg)
                <span className="relative cursor-pointer text-emerald-600 font-bold text-sm group-hover:text-emerald-800 transition">
                ⓘ
                <span className="absolute left-6 top-0 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-[9999]">
                    Blood Pressure is expressed as systolic/diastolic values (e.g., 120/80
                    mmHg). Normal levels are typically below 120/80 mmHg.
                </span>
                </span>
          </label>
          <input
            type="text"
            {...register("Blood Pressure", {
              required: "Blood Pressure is required",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
            placeholder="e.g., 120/80"
          />
          {errors["Blood Pressure"] && (
            <p className="text-red-500 text-sm mt-1">
              {errors["Blood Pressure"].message}
            </p>
          )}
        </div>
      </div>

      
      <div className="relative flex justify-between items-center pt-8 animate-fadeInUp">
        <button
          type="button"
          onClick={() => navigate("/About/step1")}
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
