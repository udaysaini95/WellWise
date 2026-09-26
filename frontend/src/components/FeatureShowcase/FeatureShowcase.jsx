// src/components/FeatureShowcase.jsx
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function FeatureShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the component is in view
  });

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.5,
      },
    },
  };

  const phoneVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.8,
      },
    },
  };

  const featureCards = [
    {
      text: "Health, Tailored to You",
      icon: "🧬",
      style: "top-10 left-0 md:left-20 bg-blue-100 text-blue-800",
    },
    {
      text: "Personalized Diet Plans",
      icon: "🍎",
      style: "top-40 left-10 md:left-40 bg-pink-100 text-pink-800",
    },
    {
      text: "Life Expectancy Estimate",
      icon: "📈",
      style: "bottom-20 left-0 md:left-10 bg-purple-100 text-purple-800",
    },
    {
      text: "Live Better, Not Just Longer",
      icon: "🧘",
      style: "top-20 right-0 md:right-20 bg-yellow-100 text-yellow-800",
    },
    {
      text: "Personalized Exercise Plans",
      icon: "🏋️‍♂️",
      style: "bottom-10 right-10 md:right-40 bg-red-100 text-red-800",
    },
    {
      text: "AI Wellness Coach",
      icon: "🧠",
      style: "bottom-40 right-0 md:right-10 bg-green-100 text-green-800",
    },
  ];

  return (
    <section ref={ref} className="relative py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
        >
          See How <span className="text-green-600">Well Wise</span> Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-3xl mx-auto text-lg text-gray-700"
        >
          Well Wise helps you understand your health better with AI-powered
          insights, personalized plans, and easy-to-use tools.
        </motion.p>
      </div>

      <div className="relative h-[700px] flex items-center justify-center">
        {/* Central Phone Mockup */}
        <motion.div
          variants={phoneVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="relative z-20 w-[300px] md:w-[350px] h-[600px] md:h-[700px] bg-black rounded-[48px] shadow-2xl flex items-center justify-center p-2"
        >
          {/* Phone Screen - The Image you provided */}
          <img
            src="https://framerusercontent.com/images/kF3nJ9b3xJ5v57H8v65y0gN4.png" // Replace with your image URL
            alt="Well Wise app UI demonstration"
            className="rounded-[40px] w-full h-full object-cover"
          />
        </motion.div>

        {/* Floating Feature Cards */}
        {featureCards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`absolute z-10 p-4 rounded-xl shadow-lg flex items-center space-x-2 whitespace-nowrap opacity-0 ${card.style}`}
            style={{
              // These styles position the cards relative to the parent container
              // and are adjusted for responsiveness.
              // For a more precise match to your screenshot, you might need
              // to fine-tune 'top', 'left', 'right', 'bottom' values further.
              position: "absolute", // Ensure absolute positioning
              // Adjust these values to fine-tune exact positions
              ...(card.style.includes("top-10 left-0") && {
                top: "10%",
                left: "0%",
                "@screen md": { left: "15%" },
              }),
              ...(card.style.includes("top-40 left-10") && {
                top: "30%",
                left: "5%",
                "@screen md": { left: "20%" },
              }),
              ...(card.style.includes("bottom-20 left-0") && {
                bottom: "15%",
                left: "0%",
                "@screen md": { left: "10%" },
              }),
              ...(card.style.includes("top-20 right-0") && {
                top: "15%",
                right: "0%",
                "@screen md": { right: "15%" },
              }),
              ...(card.style.includes("bottom-10 right-10") && {
                bottom: "8%",
                right: "5%",
                "@screen md": { right: "20%" },
              }),
              ...(card.style.includes("bottom-40 right-0") && {
                bottom: "30%",
                right: "0%",
                "@screen md": { right: "10%" },
              }),
            }}
          >
            <span className="text-2xl">{card.icon}</span>
            <span className="text-sm font-medium">{card.text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
