import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";

export default function Step1() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();

  const state_city_map = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Tirupati"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
    Assam: ["Guwahati", "Dibrugarh"],
    Bihar: ["Patna", "Gaya", "Bhagalpur"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
    Goa: ["Panaji", "Margao"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Haryana: ["Chandigarh", "Gurugram", "Faridabad"],
    "Himachal Pradesh": ["Shimla", "Dharamshala"],
    Jharkhand: ["Ranchi", "Jamshedpur"],
    Karnataka: ["Bengaluru", "Mysore", "Mangalore"],
    Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Manipur: ["Imphal"],
    Meghalaya: ["Shillong"],
    Mizoram: ["Aizawl"],
    Nagaland: ["Kohima", "Dimapur"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
    Punjab: ["Chandigarh", "Amritsar", "Ludhiana"],
    Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
    Sikkim: ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Telangana: ["Hyderabad", "Warangal"],
    Tripura: ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra"],
    Uttarakhand: ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    Chandigarh: ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman"],
    Delhi: ["Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    Ladakh: ["Leh", "Kargil"],
    Lakshadweep: ["Kavaratti"],
    Puducherry: ["Puducherry", "Karaikal"],
  };

  const [selectedState, setSelectedState] = useState(formData.State || "");
  const [selectedCity, setSelectedCity] = useState(formData.City || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      Age: Number(formData.Age) || "",
      Gender: formData.Gender || "",
      Ethnicity: formData.Ethnicity || "",
      State: formData.State || "",
      City: formData.City || "",
      "Urban/Rural": formData["Urban/Rural"] || "",
    },
  });

  useEffect(() => {
    if (formData.State) setSelectedState(formData.State);
    if (formData.City) setSelectedCity(formData.City);
  }, [formData.State, formData.City]);

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      Age: Number(data.Age),
      "Urban/Rural": data.urbanRural,
    };
    updateFormData(formattedData);
    delete formattedData.urbanRural;
    navigate("/About/step2");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden animate-fadeIn"
    >
      
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow"></div>

     
      <h2 className="relative text-4xl font-extrabold text-center text-gray-800 mb-8 animate-fadeDown">
        Step 1 — Basic Info
      </h2>

      
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Age
          </label>
          <input
            type="number"
            {...register("Age", {
              required: "Age is required",
              min: { value: 1, message: "Age must be positive" },
            })}
            placeholder="Enter your age"
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          />
          {errors.Age && (
            <p className="text-red-500 text-sm mt-1">{errors.Age.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Gender
          </label>
          <select
            {...register("Gender", { required: "Please select a gender" })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.Gender && (
            <p className="text-red-500 text-sm mt-1">{errors.Gender.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Ethnicity
          </label>
          <select
            {...register("Ethnicity", {
              required: "Please select an ethnicity",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="North Indian">North Indian</option>
            <option value="South Indian">South Indian</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Bengali">Bengali</option>
          </select>
          {errors.Ethnicity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.Ethnicity.message}
            </p>
          )}
        </div>

        
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            State
          </label>
          <select
            {...register("State", { required: "Please select a State" })}
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value;
              setSelectedState(newState);
              setValue("State", newState);
              setSelectedCity("");
              setValue("City", "");
            }}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">-- Select State --</option>
            {Object.keys(state_city_map).map((state, i) => (
              <option key={i} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.State && (
            <p className="text-red-500 text-sm mt-1">{errors.State.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            City
          </label>
          <select
            {...register("City", { required: "Please select a City" })}
            value={selectedCity}
            onChange={(e) => {
              const newCity = e.target.value;
              setSelectedCity(newCity);
              setValue("City", newCity);
            }}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">-- Select City --</option>
            {selectedState &&
              state_city_map[selectedState]?.map((city, idx) => (
                <option key={idx} value={city}>
                  {city}
                </option>
              ))}
          </select>
          {errors.City && (
            <p className="text-red-500 text-sm mt-1">{errors.City.message}</p>
          )}
        </div>

        
        <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <label className="block text-emerald-700 font-semibold mb-1">
            Urban or Rural
          </label>
          <select
            {...register("urbanRural", {
              required: "Please select a valid option",
            })}
            className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="Urban">Urban</option>
            <option value="Rural">Rural</option>
          </select>
          {errors.urbanRural && (
            <p className="text-red-500 text-sm mt-1">
              {errors.urbanRural.message}
            </p>
          )}
        </div>
      </div>

      
      <div className="relative flex justify-between items-center pt-8 animate-fadeInUp">
        <button
          type="button"
          disabled
          className="py-2.5 px-8 bg-gray-300 text-white font-medium rounded-full shadow-md cursor-not-allowed"
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
