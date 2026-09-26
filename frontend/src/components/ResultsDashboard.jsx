import React from "react";

// A reusable card component to keep our code clean and styles consistent
const InfoCard = ({ title, value, unit, category, color }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <p className="text-3xl font-bold text-gray-800 mt-2">
      {value} <span className="text-lg font-medium text-gray-600">{unit}</span>
    </p>
    {category && (
      <p
        className={`mt-1 text-sm font-semibold ${color || "text-emerald-600"}`}
      >
        {category}
      </p>
    )}
  </div>
);

export const ResultsDashboard = ({ results }) => {
  if (!results) return null; // Don't render if there are no results

  const { bmi, calories, mealPlan } = results;

  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Your Health Snapshot
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InfoCard
          title="BMI"
          value={bmi.value}
          unit="kg/m²"
          category={bmi.category}
        />
        <InfoCard
          title="Maintain Weight"
          value={calories.maintain}
          unit="kcal/day"
        />
        <InfoCard
          title="Weight Loss"
          value={calories.weightLoss}
          unit="kcal/day"
        />
      </div>

      {/* Divider */}
      <hr className="my-10 border-t border-gray-200" />

      {/* Section 2: Diet Recommender with Indigenous Foods */}
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-8">
        Indigenous Diet Recommendations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {mealPlan.map((meal, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <label className="block text-emerald-700 font-semibold mb-2">
              {meal.mealType}
            </label>
            <select className="w-full p-2.5 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition border-gray-300">
              <option value="">Select an option...</option>
              {meal.options.map((option, idx) => (
                <option key={idx} value={option.name}>
                  {option.name} (~{option.calories} kcal)
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Placeholder for future charts */}
      <div className="mt-12 text-center">
        <p className="text-gray-500">
          Your nutritional charts will appear here after you select your meals.
        </p>
      </div>
    </div>
  );
};
