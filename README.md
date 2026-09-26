# Well Wise 🍎🏋️‍♂️🥗

A web-based AI Health Assistant that uses personal and lifestyle data to provide **holistic wellness guidance**. The platform predicts health risks, estimates life expectancy, and generates personalized diet, exercise, and hydration plans. The goal is to shift users from passive data tracking to **proactive lifestyle changes**.

---

## Core Features ✨

*   **Life Expectancy Estimation:** Projects a personalized life expectancy based on user health, habits, and demographic information.
*   **Personalized Recommendations:** Generates daily diet, exercise, and hydration plans.
*   **AI Chat Support:** An integrated chatbot helps users make informed decisions.

### Personalized Planning Modules 🍏🏋️💧

1.  **Diet Planner:** Generates meal plans based on your goals (e.g., Maintain, Weight Loss), preferences, and caloric needs.
2.  **Exercise Hub:** Creates structured weekly workout plans based on your fitness level, goals, and available equipment.
3.  **Hydration Hub:** Tracks and recommends daily water intake.

---

## 🏗️ Project Architecture

The application consists of three separate services that must run simultaneously:

1.  **Frontend**: React + Vite (Port `5173`) - The user interface.
2.  **Backend**: Flask (Port `5000`) - Handles Diet & Exercise generation (uses Gemini AI).
3.  **AI Engine**: Flask (Port `5001`) - ML model for Life Expectancy prediction.

---

## 🚀 Getting Started

### Prerequisites

*   **Python 3.x**
*   **Node.js & npm**

### Installation & Execution

You need to open **3 separate terminal windows** to run the full application.

#### 1. Start the AI Engine (Terminal 1)
This service handles life expectancy predictions.

```bash
cd WellWise-AI-Engine-main
pip install -r requirements.txt
python app.py
```
*Runs on: http://localhost:5001*

#### 2. Start the Backend (Terminal 2)
This service handles the AI generation for diets and workouts.

```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Runs on: http://localhost:5000*

#### 3. Start the Frontend (Terminal 3)
This is the main user interface.

```bash
cd frontend
npm install
npm run dev
```
*Runs on: http://localhost:5173*

---

## ⚙️ Configuration

The **Backend** requires a Google Gemini API Key.
1.  Navigate to the `backend` folder.
2.  Open or create a `.env` file.
3.  Add your API key:
    ```env
    GOOGLE_API_KEY="your_api_key_here"
    ```

---

## 🔧 Troubleshooting

*   **Gemini API / Python 3.14 Compatibility**:
    If you encounter issues with the `google-generativeai` library on Python 3.14+, the backend has been configured to use direct HTTP requests to the Gemini API as a fallback. Ensure your `GOOGLE_API_KEY` is correct in `backend/.env`.

*   **Network Errors**:
    Ensure all three services (Frontend, Backend, AI Engine) are running. Concepts like Diet Plans rely on the Backend, while Life Expectancy relies on the AI Engine.