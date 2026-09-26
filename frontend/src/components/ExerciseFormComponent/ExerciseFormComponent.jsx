import React, { createContext, useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { API_BASE_URL } from "../../apiConfig";

// -------------------------------------------------------------------
// 1. Exercise Context and Provider
// -------------------------------------------------------------------
const ExerciseContext = createContext();

export const ExerciseProvider = ({ children }) => {
  const [exerciseFormData, setExerciseFormData] = useState({
    fitnessLevel: "Beginner",
    primaryGoal: "Weight Loss",
    availableEquipment: {
      bodyweight: true,
      dumbbells: false,
      resistanceBands: false,
      fullGym: false,
    },
    workoutDaysPerWeek: 3,
    timePerSession: 45,
  });

  const [exercisePlan, setExercisePlan] = useState(null);

  const updateExerciseFormData = (newData) => {
    setExerciseFormData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ExerciseContext.Provider
      value={{
        exerciseFormData,
        updateExerciseFormData,
        exercisePlan,
        setExercisePlan,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExerciseContext = () => useContext(ExerciseContext);

// -------------------------------------------------------------------
// 2. The ExerciseFormComponent
// -------------------------------------------------------------------
export const ExerciseFormComponent = () => {
  const {
    exerciseFormData,
    updateExerciseFormData,
    exercisePlan,
    setExercisePlan,
  } = useExerciseContext();
 const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, control, watch } = useForm({
    defaultValues: exerciseFormData,
  });

  const workoutDays = watch("workoutDaysPerWeek");
  const timePerSession = watch("timePerSession");

  const equipmentOptions = [
    { name: "bodyweight", label: "Bodyweight Only" },
    { name: "dumbbells", label: "Dumbbells" },
    { name: "resistanceBands", label: "Resistance Bands" },
    { name: "fullGym", label: "Full Gym" },
  ];

    const onSubmit = async (data) => {
      setIsLoading(true);

    console.log("Submitting Exercise Data:", data);
    updateExerciseFormData(data);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/get_exercise_plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to generate plan");

      const result = await response.json();
      console.log("Received Plan:", result);
      setExercisePlan(result);
    } catch (error) {
      console.warn("Fetch failed, using structured client fallback:", error);
      setExercisePlan({
        weeklyPlan: [
          {
            day: "Monday",
            focus: "Full Body Strength & Core",
            exercises: [
              { name: "Bodyweight Squats", sets: 3, reps: 15, rest: "60s", equipment: "Bodyweight" },
              { name: "Push-ups / Modified Push-ups", sets: 3, reps: 12, rest: "60s", equipment: "Bodyweight" },
              { name: "Plank Hold", sets: 3, reps: "45s", rest: "45s", equipment: "Mat" }
            ],
            intensity: "Medium",
            icon: "💪"
          },
          {
            day: "Wednesday",
            focus: "Cardio & Endurance",
            exercises: [
              { name: "Brisk Walking / Jogging", sets: 1, reps: "30 mins", rest: "N/A", equipment: "Running Shoes" },
              { name: "Jumping Jacks", sets: 4, reps: 30, rest: "30s", equipment: "Bodyweight" },
              { name: "Mountain Climbers", sets: 3, reps: 20, rest: "45s", equipment: "Bodyweight" }
            ],
            intensity: "High",
            icon: "🏃"
          },
          {
            day: "Friday",
            focus: "Flexibility & Mobility",
            exercises: [
              { name: "Sun Salutations / Yoga Flow", sets: 5, reps: "Full Sequence", rest: "30s", equipment: "Yoga Mat" },
              { name: "Cat-Cow Stretch", sets: 3, reps: 10, rest: "30s", equipment: "Mat" },
              { name: "Child's Pose Rest", sets: 2, reps: "60s", rest: "30s", equipment: "Mat" }
            ],
            intensity: "Low",
            icon: "🧘"
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-12 px-4 sm:px-8 flex flex-col items-center justify-start font-sans">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 via-white to-green-50 p-10 rounded-3xl shadow-xl overflow-hidden mt-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-green-200/20 to-blue-300/20 blur-3xl animate-pulse -z-10"></div>

        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8">
            Exercise Hub
          </h1>
          <p className="text-center text-gray-500 mb-10 -mt-6">
            Build your weekly workout plan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            {/* Fitness Level & Primary Goal */}
            <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <label className="block text-emerald-700 font-semibold mb-2">
                Your Fitness Level
              </label>
              <Controller
                name="fitnessLevel"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2.5 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition border-gray-300"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                )}
              />
            </div>

            <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <label className="block text-emerald-700 font-semibold mb-2">
                Primary Goal
              </label>
              <Controller
                name="primaryGoal"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2.5 rounded-md bg-gray-100 focus:ring-2 focus:ring-emerald-400 outline-none transition border-gray-300"
                  >
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>General Fitness</option>
                    <option>Endurance</option>
                  </select>
                )}
              />
            </div>

            {/* Equipment */}
            <div className="sm:col-span-2 group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <label className="block text-emerald-700 font-semibold mb-3">
                Available Equipment
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {equipmentOptions.map((option) => (
                  <Controller
                    key={option.name}
                    name={`availableEquipment.${option.name}`}
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-700">
                        <input
                          type="checkbox"
                          onChange={(e) => field.onChange(e.target.checked)}
                          checked={field.value}
                          className="hidden"
                        />
                        <span
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            field.value
                              ? "bg-emerald-500 border-emerald-500"
                              : "bg-gray-100 border-gray-300"
                          }`}
                        >
                          {field.value && (
                            <svg
                              className="w-3 h-3 text-white fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                            </svg>
                          )}
                        </span>
                        <span>{option.label}</span>
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <label className="block text-emerald-700 font-semibold">
                Workout Days Per Week
              </label>
              <span className="text-emerald-600 font-medium text-sm">
                {workoutDays} {workoutDays > 1 ? "days" : "day"}
              </span>
              <Controller
                name="workoutDaysPerWeek"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    {...field}
                    className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer mt-2 accent-emerald-500"
                  />
                )}
              />
            </div>

            <div className="group bg-white/80 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <label className="block text-emerald-700 font-semibold">
                Time per Session
              </label>
              <span className="text-emerald-600 font-medium text-sm">
                {timePerSession} minutes
              </span>
              <Controller
                name="timePerSession"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    {...field}
                    className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer mt-2 accent-emerald-500"
                  />
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="py-2.5 px-8 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-400/40 transition-all duration-500 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </form>

      {/* Display Generated Plan */}
      {exercisePlan && (
        <div className="w-full max-w-4xl mt-10 bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
            Your Weekly Workout Plan 💪
          </h2>
          <div className="space-y-4">
            {exercisePlan.weeklyPlan?.map((day, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100"
              >
                <h3 className="text-xl font-semibold text-emerald-700">
                  {day.icon} {day.day}: {day.focus}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Intensity: {day.intensity}
                </p>
                <ul className="list-disc list-inside text-gray-700">
                  {day.exercises.map((ex, i) => (
                    <li key={i}>
                      {ex.name} — {ex.sets} sets × {ex.reps} reps ({ex.rest}{" "}
                      rest)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
