import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion,AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer"; 
import FeatureShowcase from "../FeatureShowcase/FeatureShowcase"; 
import image1 from '../../assets/Images/homeImg-1.jpeg'; 

export default function Home() {
  const rotatingTexts = [
    "AI-powered insights.",
    "Personalized diet plans.",
    "Preventive care.",
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(
        (prevIndex) => (prevIndex + 1) % rotatingTexts.length
      );
    }, 3000); 

    return () => clearInterval(interval); 
  }, []);

  const [refImpact, inViewImpact] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div className="w-full">

      <section
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            `url(${image1})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="w-full lg:w-1/2 text-white text-center lg:text-left space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg"
            >
              Step Toward a{" "}
              <span className="text-green-500">Healthier Life</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-4 text-xl md:text-2xl font-light leading-relaxed text-gray-200"
            >
              Turning health data into actionable wellness guidance with{" "}
              <span className="block font-semibold text-green-400">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTextIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {rotatingTexts[currentTextIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.p>
            <p className="mt-2 text-lg md:text-xl font-normal text-gray-200">
              Get AI-powered insights, personalized diet plans, and preventive
              care.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-10"
            >
              <Link
                to="/About"
                className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-lime-600 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                Start Your Journey Towards Healthier Life
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="w-full lg:w-1/2 flex justify-center items-center p-4 mt-8 lg:mt-0"
          >
            {/* <img
              src="https://via.placeholder.com/600x400/00FF00/FFFFFF?text=WellWise+App+Demo" // Replace with your actual PNG image
              alt="Well Wise app showcasing health insights"
              className="max-w-full h-auto rounded-lg shadow-2xl"
            /> */}
          </motion.div>
        </div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-6 w-full flex justify-center"
        >
          <div className="animate-bounce text-white">⬇</div>
        </motion.div> */}
      </section>

      <section className="h-screen bg-gradient-to-r from-green-100 to-lime-100 flex flex-col justify-center items-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
        >
          Why Choose <span className="text-green-600">Well Wise?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl text-lg text-gray-700 mb-10"
        >
          Our AI-powered platform doesn’t just track your steps. It gives you
          real wellness insights — life expectancy estimates, personalized diet
          & exercise plans, and real-time chat.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          {[
            {
              title: "Life Estimate Prediction",
              desc: "Provides personalized insights to help you make proactive decisions about your future health.",
            },
            {
              title: "Personalized Guidance",
              desc: "Custom diet & workout plans tailored to your lifestyle and BMI.",
            },
            {
              title: "AI Wellness Chatbot",
              desc: "Chat with our AI to get health advice and preventive care tips.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              className="p-6 bg-white shadow-xl rounded-2xl hover:scale-105 transition"
            >
              <h3 className="text-xl font-semibold text-green-600 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
        >
          Real-World <span className="text-green-600">Impact</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-lg text-gray-700 mb-10"
        >
          We are committed to making a real impact on people's lives through
          data-driven health insights and proactive wellness tools.
        </motion.p>

        <div
          ref={refImpact}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: inViewImpact ? 1 : 0,
              y: inViewImpact ? 0 : 30,
            }}
            transition={{ delay: 0.5, duration: 1 }}
            className="p-6 bg-green-50 rounded-2xl shadow-lg flex flex-col items-center justify-center"
          >
            <div className="text-6xl font-extrabold text-green-600">
              {inViewImpact && (
                <CountUp end={50000} duration={3} separator="," />
              )}
            </div>
            <p className="mt-2 text-gray-600 font-semibold">Users Joined</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: inViewImpact ? 1 : 0,
              y: inViewImpact ? 0 : 30,
            }}
            transition={{ delay: 0.7, duration: 1 }}
            className="p-6 bg-green-50 rounded-2xl shadow-lg flex flex-col items-center justify-center"
          >
            <div className="text-6xl font-extrabold text-green-600">
              {inViewImpact && (
                <CountUp end={45000} duration={3} separator="," />
              )}
            </div>
            <p className="mt-2 text-gray-600 font-semibold">
              Happy Users
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: inViewImpact ? 1 : 0,
              y: inViewImpact ? 0 : 30,
            }}
            transition={{ delay: 0.9, duration: 1 }}
            className="p-6 bg-green-50 rounded-2xl shadow-lg flex flex-col items-center justify-center"
          >
            <div className="text-6xl font-extrabold text-green-600">
              {inViewImpact && <CountUp end={95} duration={3} suffix="%" />}
            </div>
            <p className="mt-2 text-gray-600 font-semibold">Wellness Score</p>
          </motion.div>
        </div>
      </section>

      
    </div>
  );
}
