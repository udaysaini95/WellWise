import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../apiConfig";

export default function VerifyLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your login...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get("token") || "demo-token";
        const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Verification failed");

        setStatus("Login successful! Redirecting you to the dashboard...");
        // In a real app, you'd save the user session here
        setTimeout(() => navigate("/"), 3000); // Redirect to home after 3 seconds
      } catch (err) {
        setError(err.message);
        setStatus("");
      }
    };
    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
      <div className="p-8">
        {status && (
          <h2 className="text-2xl font-semibold text-gray-800 animate-pulse">
            {status}
          </h2>
        )}
        {error && (
          <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
        )}
      </div>
    </div>
  );
}
