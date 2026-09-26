// src/components/Result/ResultPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, Stars } from "@react-three/drei";
import CountUp from "react-countup";
import { useLocation } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";
import { API_BASE_URL } from "../../apiConfig";

function LifeSphere({ lifeExpectancy }) {
  const meshRef = useRef();
  useFrame(() => {
    meshRef.current.rotation.y += 0.003;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#4ade80"
          emissiveIntensity={0.7}
          metalness={0.3}
          roughness={0.25}
          wireframe
        />
        <Html center>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <h2 className="text-7xl font-extrabold text-white drop-shadow-lg">
              <CountUp end={lifeExpectancy} duration={3} />
            </h2>
            <p className="text-gray-100 text-lg font-medium">Years</p>
          </motion.div>
        </Html>
      </mesh>
    </Float>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const { formData: contextData } = useFormContext();
  const [formData, setFormData] = useState(
    () => location.state?.formData || contextData || {}
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(78);
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userAge = parseInt(formData?.Age || 28);

  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  };

  useEffect(() => {
    async function handle() {
      const payload = (formData && Object.keys(formData).length > 0) 
        ? { ...formData } 
        : { Age: 28, Height: 175, Weight: 70, Gender: "Male", State: "Delhi" };
      
      delete payload.urbanRural;
      delete payload.meatFrequency;

      try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        const pred = Math.ceil(Number(data.prediction) || 78);
        setLifeExpectancy(pred);
        setBackendData(data);
        console.log("✅ Backend Response:", data);
      } catch (error) {
        console.error("Error fetching prediction, using rule-based fallback:", error);
        setLifeExpectancy(78);
      } finally {
        setLoading(false);
      }
    }
    handle();
  }, [formData]);

  const displayLifeExp = Number(lifeExpectancy) || 78;
  const displayUserAge = Number(userAge) || 28;
  const remainingYears = Math.max(1, displayLifeExp - displayUserAge);

  const scoreColors = {
    Diet: "from-green-400 to-emerald-600",
    Exercise: "from-sky-400 to-blue-600",
    Habits: "from-yellow-400 to-amber-600",
    Sleep: "from-indigo-400 to-purple-600",
    Stress: "from-pink-400 to-rose-600",
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-emerald-900 to-green-800 text-white"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle at ${50 + tilt.x * 30}% ${
              50 + tilt.y * 30
            }%, rgba(34,197,94,0.1), transparent 70%)`,
          ],
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="w-full h-[400px] mb-8">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[2, 2, 3]} intensity={1.2} color="#bbf7d0" />
          <Stars radius={100} depth={50} count={2000} factor={4} fade />
          <LifeSphere lifeExpectancy={displayLifeExp} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center mb-10"
      >
        <h3 className="text-3xl font-semibold text-lime-300">
          Remaining Life Expectancy:{" "}
          <span className="text-white font-bold">
            <CountUp end={remainingYears} duration={2} /> years
          </span>
        </h3>
        <p className="text-gray-300 mt-2 text-lg">(Current age: {displayUserAge})</p>
      </motion.div>


      {loading && (
        <p className="text-gray-300 text-xl mt-10 animate-pulse">
          ⏳ Calculating your life expectancy...
        </p>
      )}

      {!loading && backendData?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl mb-10 text-center"
        >
          <p className="text-xl text-gray-200">{backendData.summary}</p>
        </motion.div>
      )}

      {!loading && backendData?.health_scores && (
        <div className="max-w-5xl w-full px-8 mb-16">
          <h2 className="text-3xl font-bold text-green-300 mb-6 text-center">
            🧬 Your Health Scores
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {Object.entries(backendData.health_scores).map(([key, value]) => (
              <div
                key={key}
                className={`p-6 rounded-2xl bg-gradient-to-br ${
                  scoreColors[key] || "from-gray-500 to-gray-700"
                } text-center shadow-lg border border-white/10 transition-transform hover:scale-105`}
              >
                <h3 className="text-xl font-semibold text-white">{key}</h3>
                <p className="text-3xl font-bold text-white">
                  {value.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!loading && backendData?.adjustments && (
        <>
          <h2 className="text-3xl font-bold text-green-300 mb-6 text-center">
            🌿 Positive Impacts
          </h2>
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 px-8 mb-16 text-center">
            {backendData.adjustments
              .filter((a) => a.impact > 0)
              .map((impact, i) => (
                <a
                  key={i}
                  href={`https://www.healthline.com/search?q=${encodeURIComponent(
                    impact.factor
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 w-[260px] rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg backdrop-blur-md border border-white/10 hover:scale-105 hover:shadow-2xl transition-transform"
                >
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {impact.factor}
                  </h3>
                  <p className="text-lg text-white/90">
                    +{impact.impact.toFixed(1)} years
                  </p>
                </a>
              ))}
          </div>

          {backendData.adjustments.some((a) => a.impact < 0) && (
            <>
              <h2 className="text-3xl font-bold text-red-400 mb-6 text-center">
                ⚠️ Negative Impacts
              </h2>
              <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 px-8 mb-16 text-center">
                {backendData.adjustments
                  .filter((a) => a.impact < 0)
                  .map((impact, i) => (
                    <a
                      key={i}
                      href={`https://www.healthline.com/search?q=${encodeURIComponent(
                        impact.factor
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-6 w-[260px] rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 shadow-lg backdrop-blur-md border border-white/10 hover:scale-105 hover:shadow-2xl transition-transform"
                    >
                      <h3 className="text-2xl font-bold mb-2 text-white">
                        {impact.factor}
                      </h3>
                      <p className="text-lg text-white/90">
                        {impact.impact.toFixed(1)} years
                      </p>
                    </a>
                  ))}
              </div>
            </>
          )}

          {backendData?.adjustment_factor && (
            <div className="max-w-md mx-auto text-center mb-10">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-500 to-gray-700 shadow-lg border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  ⚖️ Adjustment Factor
                </h3>
                <p className="text-3xl font-extrabold text-emerald-300">
                  {backendData.adjustment_factor.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {backendData?.recommendations?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl p-8 mb-16"
            >
              <h3 className="text-2xl font-bold text-green-300 mb-6">💡 Recommendations</h3>

              <div className="space-y-6">
                {backendData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-br from-emerald-800/40 to-emerald-600/30 rounded-2xl border border-emerald-400/20 shadow-inner"
                  >
                    <h4 className="text-xl font-semibold text-emerald-300 mb-2">
                      {rec.title}
                    </h4>
                    <p className="text-gray-100 leading-relaxed">{rec.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
