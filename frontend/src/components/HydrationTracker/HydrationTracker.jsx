import React, { useState, useMemo, useEffect, useRef } from "react";

// A custom hook for animating numbers
const useCountUp = (end, duration = 1) => {
  // Initialize state with the end value to prevent animating from 0 on the initial load.
  const [count, setCount] = useState(end);
  const animationFrameId = useRef();
  const startTimeRef = useRef();
  // We need a ref for the start value to avoid stale closures inside the animation loop.
  const startValueRef = useRef(end);

  useEffect(() => {
    // When the `end` prop changes, it triggers this effect to start a new animation.
    // The animation will start from wherever the count currently is.
    startValueRef.current = count;
    startTimeRef.current = performance.now();

    const animate = (timestamp) => {
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const currentAnimatedValue = Math.round(
        startValueRef.current + (end - startValueRef.current) * progress
      );

      setCount(currentAnimatedValue);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    // Kick off the animation.
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function to cancel the animation if the component unmounts
    // or if the `end` value changes again before this animation finishes.
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [end, duration]); // Re-run the effect only when the target 'end' or 'duration' changes.

  // This effect ensures that on the very first render, the count is correctly
  // set to the initial `end` value, especially when loading from localStorage.
  useEffect(() => {
    setCount(end);
  }, [end]);

  return count;
};

// Confetti Component
const Confetti = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 2 + 3,
        delay: Math.random() * 2,
        color: ["#22c55e", "#4ade80", "#86efac", "#bbf7d0"][
          Math.floor(Math.random() * 4)
        ],
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-4 rounded-full"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
};

// Main App Component
export default function App() {
  const BASE_GOAL_ML = 2000;
  const GLASS_SIZE_ML = 250;

  const [dailyGoal, setDailyGoal] = useState(BASE_GOAL_ML);
  const [weatherInfo, setWeatherInfo] = useState("Fetching local weather...");

  // State is now initialized from localStorage
  const [intake, setIntake] = useState(() => {
    try {
      const savedIntake = localStorage.getItem("hydrationIntake");
      return savedIntake ? JSON.parse(savedIntake) : 0;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return 0;
    }
  });

  const [animate, setAnimate] = useState(false);

  // Effect for fetching location and weather data on mount
  useEffect(() => {
    const fetchWeatherAndLocation = async (lat, lon) => {
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`
        );
        const weatherData = await weatherResponse.json();
        const humidity = weatherData.current.relative_humidity_2m;

        const locationResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const locationData = await locationResponse.json();
        const city = locationData.city || "your area";

        let newGoal = BASE_GOAL_ML;
        if (humidity > 75) {
          newGoal += 500; // Add 500ml for very high humidity
        } else if (humidity > 60) {
          newGoal += 250; // Add 250ml for moderate humidity
        }

        setDailyGoal(newGoal);
        setWeatherInfo(
          `With ${humidity}% humidity in ${city}, your goal is ${newGoal}ml today.`
        );
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherInfo("Could not fetch weather. Using default goal.");
        setDailyGoal(BASE_GOAL_ML);
      }
    };

    const locationSuccess = (position) => {
      fetchWeatherAndLocation(
        position.coords.latitude,
        position.coords.longitude
      );
    };

    const locationError = () => {
      console.error("Location permission denied. Using default.");
      // Default to Gwalior, India if permission is denied
      fetchWeatherAndLocation(26.2183, 78.1828);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    } else {
      locationError(); // Geolocation not supported
    }

    setTimeout(() => setAnimate(true), 100);
  }, []);

  // Effect to save intake to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("hydrationIntake", JSON.stringify(intake));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [intake]);

  const addWater = () => {
    setIntake((prevIntake) => Math.min(prevIntake + GLASS_SIZE_ML, dailyGoal));
  };

  const resetIntake = () => {
    setIntake(0);
  };

  const progress = useMemo(
    () => (intake / dailyGoal) * 100,
    [intake, dailyGoal]
  );
  const animatedProgress = useCountUp(Math.round(progress), 1);

  const glassesConsumed = intake / GLASS_SIZE_ML;
  const goalInGlasses = dailyGoal / GLASS_SIZE_ML;

  const getEncouragement = () => {
    if (progress >= 100) return "Great job! You reached your goal! 🎉";
    if (progress >= 75) return "You're almost there, keep it up!";
    if (progress >= 50) return "You're halfway there!";
    if (progress > 0) return "Good start! Every drop counts.";
    return "Let's get hydrated!";
  };

  const circumference = 2 * Math.PI * 70; // 70 is the radius (r) of the circle
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-green-50 min-h-screen flex items-center justify-center font-sans p-4">
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center transition-all duration-500 ease-in-out transform mt-20 ${
          animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {progress >= 100 && <Confetti />}

        <h1 className="text-3xl font-bold text-green-800">Hydration Tracker</h1>
        <p className="text-gray-600 text-xs mt-2 mb-4 h-8">{weatherInfo}</p>
        <p className="text-gray-500 -mt-2 mb-6 h-6">{getEncouragement()}</p>

        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#f0fdf4"
              strokeWidth="16"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#16a34a"
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-green-900 drop-shadow-sm">
                {animatedProgress}%
              </span>
              <p className="text-sm text-green-700 font-medium">Completed</p>
            </div>
          </div>
        </div>

        <div className="text-lg font-semibold text-green-900 mb-6">
          <span>{intake}</span> / <span>{dailyGoal} ml</span>
          <p className="text-sm font-normal text-gray-500 mt-1">
            ({glassesConsumed.toFixed(1)} of {goalInGlasses.toFixed(1)} glasses)
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={addWater}
            disabled={intake >= dailyGoal}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:bg-green-300 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            Add a Glass ({GLASS_SIZE_ML}ml)
          </button>
          <button
            onClick={resetIntake}
            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(120vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
}
