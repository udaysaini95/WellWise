import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import image2 from "../../assets/Images/image2.jpg";

export default function About() {
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    "/about/step1",
    "/about/step2",
    "/about/step3",
    "/about/step4",
    "/about/step5",
    "/about/submit",
  ];

  const stepTitles = [
    "Basic Info",
    "Health Metrics",
    "Lifestyle",
    "Dietary Habits",
    "Medical History",
    "Review & Submit",
  ];

  const currentIndex = steps.findIndex(
    (step) => step.toLowerCase() === location.pathname.toLowerCase()
  );

  React.useEffect(() => {
    if (location.pathname.toLowerCase() === "/about") {
      navigate("/about/step1", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <img
          src={image2}
          alt="Background"
          className="w-full h-full object-cover scale-110 animate-[slowZoom_30s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 backdrop-blur-sm"></div>
      </div>
      <div className="relative z-10 text-white min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-10 animate-fadeIn">
        <div className="text-center max-w-5xl mx-auto mb-10">
          <h1 className="pt-6 mt-6 text-5xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl animate-slideDown">
            Fill the <span className="text-green-400">Well Form</span>
          </h1>
          <p className="mt-3 text-gray-300 text-base md:text-lg font-light animate-fadeIn delay-300">
            Please complete each section carefully — your wellness starts here.
          </p>
        </div>

        <div className="w-full max-w-5xl mb-10">
          <div className="flex justify-between mb-2 text-sm font-semibold text-gray-200">
            <span>
              Step {currentIndex >= 0 ? currentIndex + 1 : 1} of {steps.length}
            </span>
            <span className="text-green-400">
              {stepTitles[currentIndex] || stepTitles[0]}
            </span>
          </div>
          <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 transition-all duration-700 ease-out shadow-[0_0_10px_2px_rgba(34,197,94,0.6)]"
              style={{
                width: `${
                  currentIndex >= 0
                    ? ((currentIndex + 1) / steps.length) * 100
                    : (1 / steps.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mt-4 w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.25)] border border-white/30 p-12 md:p-16 text-gray-800 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(34,197,94,0.25)] animate-fadeUp">
          <Outlet /> {/* Form fields stay untouched */}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowZoom {
          from { transform: scale(1.1); }
          to { transform: scale(1.25); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        .animate-fadeUp {
          animation: fadeUp 1.3s ease forwards;
        }
        .animate-slideDown {
          animation: slideDown 1s ease forwards;
        }
      `}</style>
    </div>
  );
}
