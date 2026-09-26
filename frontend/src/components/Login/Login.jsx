import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { API_BASE_URL } from "../../apiConfig";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      setMessage(
        "Success! Please check your Mailtrap inbox for the login link."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Log in to Well Wise
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-lime-600 hover:scale-105 transition disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        </form>
        {message && (
          <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
