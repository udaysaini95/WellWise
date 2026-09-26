import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const dotsRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * 10;
    const rotateY = ((x - rect.width / 2) / rect.width) * 10;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("Account created successfully! Redirecting...");
    const mockUser = { name: name || "WellWise User", email: email || "demo@wellwise.ai" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    setTimeout(() => navigate("/About"), 1000);
  };

  useEffect(() => {
    const canvas = dotsRef.current;
    const ctx = canvas.getContext("2d");
    let width, height, dots;

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots = Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      dots.forEach((dot) => {
        dot.x += dot.dx;
        dot.y += dot.dy;
        if (dot.x < 0 || dot.x > width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > height) dot.dy *= -1;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, []);

  return (
    <div className="signup-page">
      <canvas ref={dotsRef} className="dots-bg" />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="signup-card"
      >
        <h2 className="signup-title">Create Your Account</h2>

        <form onSubmit={handleSignup} className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <p className="toggle-link">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")}>Login</button>
        </p>
      </div>
    </div>
  );
}
