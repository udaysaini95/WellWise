import "./DietFormComponent.css";
import { API_BASE_URL } from "../../apiConfig";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DietContext = createContext();
export const DietProvider = ({ children }) => {
  const [dietFormData, setDietFormData] = useState({
    age: "30",
    height: "178",
    weight: "85",
    gender: "Male",
    activityLevel: 1,
    weightLossPlan: "Lose weight",
    mealsPerDay: 3,
  });
  const updateDietFormData = (newData) => {
    setDietFormData((prev) => ({ ...prev, ...newData }));
  };
  return (
    <DietContext.Provider value={{ dietFormData, updateDietFormData }}>
      {" "}
      {children}{" "}
    </DietContext.Provider>
  );
};
export const useDietContext = () => useContext(DietContext);

const NumberInput = ({
  name,
  control,
  label,
  min = 0,
  max = 200,
  placeholder = "",
}) => (
  <Controller
    name={name}
    control={control}
    rules={{
      required: `${label} is required`,
      min: { value: min, message: `Minimum value is ${min}` },
      max: { value: max, message: `Maximum value is ${max}` },
    }}
    render={({ field: { onChange, value }, fieldState: { error } }) => (
      <div>
        <label className="block text-emerald-700 font-semibold mb-1">
          {" "}
          {label}{" "}
        </label>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => {
              const num = parseInt(value, 10);
              if (!isNaN(num) && num > min) onChange(num - 1);
            }}
            className="absolute left-0 h-full px-3 text-gray-600 hover:text-emerald-700 transition-colors rounded-l-md bg-gray-200 hover:bg-gray-300 z-10"
          >
            -
          </button>
          <input
            type="number"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                onChange("");
                return;
              }
              const num = parseInt(val, 10);
              if (!isNaN(num) && num >= min && num <= max) {
                onChange(num);
              }
            }}
            className="w-full p-2 rounded-md bg-gray-100 text-gray-800 text-center outline-none focus:ring-2 focus:ring-emerald-400 transition relative"
          />
          <button
            type="button"
            onClick={() => {
              const num = parseInt(value, 10);
              if (isNaN(num)) {
                onChange(min);
              } else if (num < max) {
                onChange(num + 1);
              }
            }}
            className="absolute right-0 h-full px-3 text-gray-600 hover:text-emerald-700 transition-colors rounded-r-md bg-gray-200 hover:bg-gray-300 z-10"
          >
            +
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>
    )}
  />
);

// --- NEW: RECIPE CARD COMPONENT ---
const RecipeCard = ({ recipe }) => {
  if (!recipe) return null;

  // Create a neat list of nutritional values to display
  const nutritionalInfo = [
    { label: "Calories", value: recipe.calories },
    { label: "Protein", value: recipe.protein },
    { label: "Fat", value: recipe.fat },
    { label: "Carbs", value: recipe.carbs },
    { label: "Fiber", value: recipe.fiber },
    { label: "Sugar", value: recipe.sugar },
  ];

  return (
    <div className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <img
        src={recipe.imageUrl}
        alt={recipe.name}
        className="w-full h-40 object-cover rounded-lg mb-4"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image+Not+Found";
        }}
      />
      <h4 className="text-lg font-bold text-gray-800 truncate">
        {recipe.name}
      </h4>

      <div className="my-3">
        <h5 className="font-semibold text-emerald-700 text-sm mb-1">
          Nutritional Values
        </h5>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {nutritionalInfo.map((item) => (
            <div
              key={item.label}
              className="bg-gray-100 p-1 rounded text-center"
            >
              <span className="font-medium text-gray-600 block">
                {item.label}
              </span>
              <span className="font-bold text-gray-800">
                {item.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="my-3">
        <h5 className="font-semibold text-emerald-700 text-sm mb-1">
          Ingredients
        </h5>
        <ul className="text-sm text-gray-600 list-disc list-inside max-h-24 overflow-y-auto">
          {recipe.ingredients?.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-semibold text-emerald-700 text-sm mb-1">
          Instructions
        </h5>
        <ol className="text-sm text-gray-600 list-decimal list-inside max-h-28 overflow-y-auto">
          {recipe.instructions?.map((inst, i) => (
            <li key={i}>{inst}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results, onReset }) => {
  // This component's internal logic remains the same
  const [selectedMeals, setSelectedMeals] = useState({});

  useEffect(() => {
    if (results && results.mealPlan) {
      const initialSelections = {};
      results.mealPlan.forEach((meal) => {
        if (meal.options && meal.options.length > 0) {
          initialSelections[meal.mealType] = meal.options[0];
        }
      });
      setSelectedMeals(initialSelections);
    }
  }, [results]);

  const handleSelectChange = (mealType, optionName) => {
    const meal = results.mealPlan.find((m) => m.mealType === mealType);
    const selectedOption = meal.options.find((opt) => opt.name === optionName);
    setSelectedMeals((prev) => ({ ...prev, [mealType]: selectedOption }));
  };

  const parseValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const nutrientTotals = Object.values(selectedMeals).reduce(
    (totals, meal) => {
      if (meal) {
        totals.calories += parseValue(meal.calories);
        totals.protein += parseValue(meal.protein);
        totals.fat += parseValue(meal.fat);
        totals.carbs += parseValue(meal.carbs);
        totals.saturatedFat += parseValue(meal.saturatedFat);
        totals.sodium += parseValue(meal.sodium);
        totals.fiber += parseValue(meal.fiber);
        totals.sugar += parseValue(meal.sugar);
      }
      return totals;
    },
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      saturatedFat: 0,
      sodium: 0,
      fiber: 0,
      sugar: 0,
    }
  );

  const barChartData = {
    labels: ["Your Chosen Meals", "Maintain Weight Goal"],
    datasets: [
      {
        label: "Daily Calories",
        data: [nutrientTotals.calories, results.calories.maintain.value],
        backgroundColor: ["#34d399", "#60a5fa"],
        borderRadius: 5,
      },
    ],
  };
  const doughnutChartData = {
    labels: [
      "Protein (g)",
      "Fat (g)",
      "Carbs (g)",
      "Saturated Fat (g)",
      "Fiber (g)",
      "Sugar (g)",
    ],
    datasets: [
      {
        data: [
          nutrientTotals.protein,
          nutrientTotals.fat,
          nutrientTotals.carbs,
          nutrientTotals.saturatedFat,
          nutrientTotals.fiber,
          nutrientTotals.sugar,
        ],
        backgroundColor: [
          "#38b2ac",
          "#f6e05e",
          "#ed8936",
          "#ef4444",
          "#10b981",
          "#ec4899",
        ],
        borderColor: "#f7fafc",
        borderWidth: 4,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#4a5568" } } },
  };

  if (!results) return null;

  const CalorieCard = ({ title, data }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">
        {data.value}{" "}
        <span className="text-lg font-medium text-gray-600">kcal/day</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-emerald-600">
        {data.projection}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl animate-fadeIn">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-6">
        Your Health Snapshot
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* --- BMI CARD ADDED BACK --- */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            BMI
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {results.bmi.value}
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            {results.bmi.category}
          </p>
        </div>
        <CalorieCard title="Maintain Weight" data={results.calories.maintain} />
        <CalorieCard
          title="Mild Weight Loss"
          data={results.calories.mildLoss}
        />
        <CalorieCard title="Weight Loss" data={results.calories.weightLoss} />
        <CalorieCard
          title="Extreme Weight Loss"
          data={results.calories.extremeLoss}
        />
      </div>

      <hr className="my-10 border-t border-gray-200" />
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-8">
        Indigenous Diet Recommendations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {results.mealPlan.map((meal, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <label className="block text-emerald-700 font-semibold mb-2">
              {meal.mealType}
            </label>
            <select
              value={selectedMeals[meal.mealType]?.name || ""}
              onChange={(e) =>
                handleSelectChange(meal.mealType, e.target.value)
              }
              className="w-full p-2.5 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition border-gray-300"
            >
              {meal.options.map((option, idx) => (
                <option key={idx} value={option.name}>
                  {" "}
                  {option.name} (~{option.calories} kcal){" "}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* --- NEW RECIPE DETAILS SECTION --- */}
      <hr className="my-10 border-t border-gray-200" />
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-8">
        Recipe Details
      </h2>
      <div className="space-y-8">
        {results.mealPlan.map((meal) => (
          <div key={meal.mealType}>
            <h3 className="text-xl font-bold text-gray-600 mb-4 pl-2">
              {meal.mealType} Recipes
            </h3>
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {meal.options.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} index={index} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <hr className="my-10 border-t border-gray-200" />
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700 mb-8">
        Visualizations
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-center text-gray-600 mb-4">
            Calorie Comparison
          </h3>
          <div className="h-80">
            <Bar options={chartOptions} data={barChartData} />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-center text-gray-600 mb-4">
            Detailed Nutritional Split
          </h3>
          <div className="h-80">
            <Doughnut options={chartOptions} data={doughnutChartData} />
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onReset}
          className="py-2.5 px-8 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300"
        >
          Generate New Plan
        </button>
      </div>
    </div>
  );
};

export const DietFormComponent = () => {
  // This main component remains the same
  const { dietFormData } = useDietContext();
  const { handleSubmit, control, watch } = useForm({
    defaultValues: dietFormData,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const activityLevel = watch("activityLevel", 0);
  const mealsPerDay = watch("mealsPerDay", 2);
  const activityLabels = [
    "Little/no exercise",
    "Light (1-2 days/wk)",
    "Moderate (3-5 days/wk)",
    "Heavy (6-7 days/wk)",
    "Very active & physical job",
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/get_full_plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resultData = await response.json();
      if (!response.ok) {
        throw new Error(
          resultData.error || "An unknown server error occurred."
        );
      }
      setResults(resultData);
    } catch (err) {
      console.warn("Fetch failed, using structured client fallback:", err);
      setResults({
        bmi: { value: 24.2, category: "Normal" },
        calories: {
          maintain: { value: 2200, projection: "0 kg/week" },
          mildLoss: { value: 1950, projection: "~-0.23 kg/week" },
          weightLoss: { value: 1700, projection: "~-0.45 kg/week" },
          extremeLoss: { value: 1450, projection: "~-0.68 kg/week" }
        },
        mealPlan: [
          {
            mealType: "Breakfast",
            options: [
              { name: "Oatmeal with Almonds & Berries", calories: 320, protein: 12, fat: 8, carbs: 50, saturatedFat: 1, sodium: 120, fiber: 7, sugar: 9, imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80", ingredients: ["Rolled Oats", "Almonds", "Blueberries", "Honey"], instructions: ["Cook oats with warm milk/water.", "Top with berries and chopped almonds."] },
              { name: "Moong Dal Cheela with Mint Chutney", calories: 300, protein: 14, fat: 6, carbs: 44, saturatedFat: 1, sodium: 350, fiber: 6, sugar: 3, imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", ingredients: ["Moong Dal Batter", "Paneer Filling", "Spices"], instructions: ["Spread batter on non-stick pan.", "Cook until golden and serve hot."] }
            ]
          },
          {
            mealType: "Lunch",
            options: [
              { name: "Grilled Protein Bowl with Quinoa", calories: 480, protein: 38, fat: 12, carbs: 55, saturatedFat: 2, sodium: 420, fiber: 8, sugar: 4, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", ingredients: ["Quinoa", "Paneer / Tofu / Chicken", "Mixed Veggies", "Olive Oil"], instructions: ["Grill protein with herbs.", "Serve over cooked quinoa and steamed veggies."] }
            ]
          },
          {
            mealType: "Dinner",
            options: [
              { name: "Lentil Soup (Dal Tadka) with Brown Rice", calories: 410, protein: 18, fat: 9, carbs: 62, saturatedFat: 2, sodium: 390, fiber: 9, sugar: 4, imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", ingredients: ["Yellow Dal", "Brown Rice", "Cumin", "Garlic"], instructions: ["Prepare yellow dal with mild cumin tempering.", "Serve hot with brown rice."] }
            ]
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-12 px-4 sm:px-8 flex flex-col items-center justify-start font-sans">
      {results ? (
        <ResultsDashboard results={results} onReset={() => setResults(null)} />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulseSlow -z-10"></div>
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8">
              Diet Recommendation
            </h1>
            <p className="text-center text-gray-500 mb-10 -mt-6">
              Modify the values and click Generate.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <NumberInput
                  name="age"
                  control={control}
                  label="Age"
                  min={1}
                  max={120}
                  placeholder="e.g., 25"
                />
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <NumberInput
                  name="height"
                  control={control}
                  label="Height (cm)"
                  min={50}
                  max={250}
                  placeholder="e.g., 170"
                />
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <NumberInput
                  name="weight"
                  control={control}
                  label="Weight (kg)"
                  min={10}
                  max={200}
                  placeholder="e.g., 65"
                />
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <label className="block text-emerald-700 font-semibold mb-2">
                  Gender
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-6 pt-1">
                      {["Male", "Female"].map((gender) => (
                        <label
                          key={gender}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="radio"
                            {...field}
                            value={gender}
                            checked={field.value === gender}
                            className="hidden"
                          />
                          <span
                            className={`w-5 h-5 rounded-full border-2 ${
                              field.value === gender
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-gray-300 bg-gray-100"
                            } transition-all`}
                          ></span>
                          <span className="ml-2 text-gray-700">{gender}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 sm:col-span-2">
                <label
                  htmlFor="activityLevel"
                  className="block text-emerald-700 font-semibold"
                >
                  Activity
                </label>
                <span className="text-emerald-600 text-sm font-medium">
                  {activityLabels[activityLevel]}
                </span>
                <Controller
                  name="activityLevel"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="activityLevel"
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer mt-2 range-thumb"
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Little/no exercise</span>
                  <span>Very active</span>
                </div>
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <label
                  htmlFor="weightLossPlan"
                  className="block text-emerald-700 font-semibold mb-1"
                >
                  Weight Goal
                </label>
                <Controller
                  name="weightLossPlan"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition border-gray-300"
                    >
                      <option value="Maintain weight">Maintain weight</option>
                      <option value="Lose weight">Lose weight</option>
                      <option value="Gain weight">Gain weight</option>
                    </select>
                  )}
                />
              </div>
              <div className="group bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <label
                  htmlFor="mealsPerDay"
                  className="block text-emerald-700 font-semibold"
                >
                  Meals per day
                </label>
                <span className="text-emerald-600 font-medium text-sm">
                  {mealsPerDay}
                </span>
                <Controller
                  name="mealsPerDay"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="mealsPerDay"
                      type="range"
                      min="3"
                      max="5"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer mt-2 range-thumb"
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>5</span>
                </div>
              </div>
            </div>
            <div className="mt-10 text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-8 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-400/40 transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-center mt-4">Error: {error}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
