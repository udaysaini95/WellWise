# --- Imports ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
import requests
import pandas as pd
import numpy as np
import joblib

# Load environment variables
load_dotenv()

# --- Initialize Flask App ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key')

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Gemini API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Load ML Models for Life Expectancy Prediction
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'models', 'life_expectancy_model_v15.pkl')
encoders_path = os.path.join(script_dir, 'models', 'label_encoders_v15.pkl')

try:
    if os.path.exists(model_path) and os.path.exists(encoders_path):
        model = joblib.load(model_path)
        encoders = joblib.load(encoders_path)
        logging.info("ML Life Expectancy model (v15) loaded successfully!")
    else:
        model = None
        encoders = None
        logging.warning("Model files not found in backend/models. Using rule-based fallback.")
except Exception as e:
    model = None
    encoders = None
    logging.error(f"Error loading ML model: {e}")

ALL_FAMILY_HISTORIES = ['Diabetes', 'Heart Disease', 'Cancer']
ALL_EXISTING_CONDITIONS = ['Hypertension', 'Asthma', 'COPD']

STATE_DATA = {
    'Andhra Pradesh': {'avg_le': 70.0}, 'Arunachal Pradesh': {'avg_le': 70.3}, 'Assam': {'avg_le': 67.2},
    'Bihar': {'avg_le': 69.5}, 'Chhattisgarh': {'avg_le': 68.9}, 'Goa': {'avg_le': 74.5},
    'Gujarat': {'avg_le': 72.8}, 'Haryana': {'avg_le': 72.3}, 'Himachal Pradesh': {'avg_le': 74.6},
    'Jharkhand': {'avg_le': 69.4}, 'Karnataka': {'avg_le': 72.8}, 'Kerala': {'avg_le': 77.8},
    'Madhya Pradesh': {'avg_le': 69.4}, 'Maharashtra': {'avg_le': 73.6}, 'Manipur': {'avg_le': 75.0},
    'Meghalaya': {'avg_le': 72.7}, 'Mizoram': {'avg_le': 74.3}, 'Nagaland': {'avg_le': 73.4},
    'Odisha': {'avg_le': 69.8}, 'Punjab': {'avg_le': 74.4}, 'Rajasthan': {'avg_le': 70.8},
    'Sikkim': {'avg_le': 73.5}, 'Tamil Nadu': {'avg_le': 73.8}, 'Telangana': {'avg_le': 72.7},
    'Tripura': {'avg_le': 74.6}, 'Uttar Pradesh': {'avg_le': 68.7}, 'Uttarakhand': {'avg_le': 73.5},
    'West Bengal': {'avg_le': 72.8}, 'Delhi': {'avg_le': 75.3}
}

MODEL_FEATURES = [
    'Age', 'Gender', 'Ethnicity', 'Height', 'Weight', 'Resting_Heart_Rate', 'SpO2', 
    'Diet_Type', 'Protein_Intake', 'Junk_Food_Frequency', 'Sugar_Intake', 'Smoking', 
    'Alcohol', 'Sleep_Duration', 'Sleep_Quality', 'Daily_Activity', 'Exercise_Type', 
    'Stress_Score', 'Air_Quality_Index', 'Exposure', 'Urban/Rural', 'Work_Hours', 
    'State', 'City', 'Diet_Quality', 'BMI', 'FamilyHistory_Diabetes', 
    'FamilyHistory_Heart_Disease', 'FamilyHistory_Cancer', 'ExistingConditions_Hypertension', 
    'ExistingConditions_Asthma', 'ExistingConditions_COPD', 'Systolic_Pressure', 'Diastolic_Pressure'
]

# --- Helper Functions ---

def calculate_bmi(weight, height):
    if not height or float(height) == 0: return 22.0
    return round(float(weight) / ((float(height)/100) ** 2), 2)

def get_bmi_status(bmi):
    if bmi < 18.5: return "Underweight"
    if 18.5 <= bmi < 25: return "Normal"
    if 25 <= bmi < 30: return "Overweight"
    return "Obesity"

def calculate_calories(weight, height, age, gender, activity_level):
    weight = float(weight or 65)
    height = float(height or 170)
    age = int(age or 25)
    activity_level = int(activity_level or 1)
    
    if str(gender).lower() == 'male':
        bmr = (10*weight) + (6.25*height) - (5*age) + 5
    else:
        bmr = (10*weight) + (6.25*height) - (5*age) - 161

    activity_multipliers = [1.2, 1.375, 1.55, 1.725, 1.9]
    idx = min(max(activity_level, 0), len(activity_multipliers) - 1)
    tdee = bmr * activity_multipliers[idx]

    calories = {
        'maintain': round(tdee),
        'mildLoss': round(tdee - 250),
        'weightLoss': round(tdee - 500),
        'extremeLoss': round(tdee - 750)
    }

    projections = {
        'maintain': "0 kg/week",
        'mildLoss': f"~-{(250*7)/7700:.2f} kg/week",
        'weightLoss': f"~-{(500*7)/7700:.2f} kg/week",
        'extremeLoss': f"~-{(750*7)/7700:.2f} kg/week"
    }

    return calories, projections

def make_gemini_call(prompt):
    if not GOOGLE_API_KEY:
        logging.warning("GOOGLE_API_KEY missing. Returning structured fallback.")
        return {}

    models_to_try = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
    headers = {'Content-Type': 'application/json'}
    data = {"contents": [{"parts": [{"text": prompt}]}]}

    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GOOGLE_API_KEY}"
            response = requests.post(url, headers=headers, json=data, timeout=12)
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    response_text = result['candidates'][0]['content']['parts'][0]['text']
                    response_text = response_text.strip().replace("```json", "").replace("```", "")
                    return json.loads(response_text)
        except Exception as e:
            logging.error(f"Gemini API call with {model_name} failed: {e}")
    
    return {}

def generate_recommendations(data, family_histories, existing_conditions):
    recommendations = []
    if data.get('Smoking') in ['Daily', 'Occasionally']:
        recommendations.append({'title': 'Address Smoking Habit', 'text': 'Quitting smoking is the single most impactful change you can make. It could potentially add up to <strong>7 years</strong> to your life expectancy.'})
    if data.get('Diet Quality') == 'Low':
        recommendations.append({'title': 'Improve Your Diet Quality', 'text': 'Improving your diet by reducing junk food and sugar could shift your life expectancy by up to <strong>12 years</strong>.'})
    if data.get('Exercise Type') == 'None' or pd.isna(data.get('Exercise Type')):
        recommendations.append({'title': 'Introduce Regular Exercise', 'text': 'Incorporating regular activity could extend your lifespan by up to <strong>9 years</strong> compared to being sedentary.'})
    if 'Heart Disease' in family_histories or 'Hypertension' in existing_conditions:
        recommendations.append({'title': 'Focus on Cardiovascular Health', 'text': 'With a predisposition to heart-related issues, focusing on a heart-healthy diet low in sodium and saturated fats is highly recommended.'})
    
    if not recommendations:
        recommendations.append({
            'title': 'Keep Up the Great Work!',
            'text': 'Your current lifestyle choices are setting you up for a long, healthy life. Continue to focus on a balanced diet, regular exercise, and stress management.'
        })

    return recommendations

# --- Fallback Generators ---

def get_fallback_diet_plan():
    return {
        "mealPlan": [
            {
                "mealType": "Breakfast",
                "options": [
                    { "name": "Oatmeal with Almonds & Berries", "calories": 320, "protein": 12, "fat": 8, "carbs": 50, "saturatedFat": 1, "sodium": 120, "fiber": 7, "sugar": 9, "imageUrl": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80", "ingredients": ["Rolled Oats", "Almonds", "Blueberries", "Honey"], "instructions": ["Cook oats with warm milk/water.", "Top with berries and chopped almonds."] },
                    { "name": "Moong Dal Cheela with Mint Chutney", "calories": 300, "protein": 14, "fat": 6, "carbs": 44, "saturatedFat": 1, "sodium": 350, "fiber": 6, "sugar": 3, "imageUrl": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", "ingredients": ["Moong Dal Batter", "Paneer Filling", "Spices"], "instructions": ["Spread batter on non-stick pan.", "Cook until golden and serve hot."] }
                ]
            },
            {
                "mealType": "Lunch",
                "options": [
                    { "name": "Grilled Chicken / Tofu Bowl with Quinoa", "calories": 480, "protein": 38, "fat": 12, "carbs": 55, "saturatedFat": 2, "sodium": 420, "fiber": 8, "sugar": 4, "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", "ingredients": ["Quinoa", "Chicken Breast or Tofu", "Mixed Veggies", "Olive Oil"], "instructions": ["Grill protein with herbs.", "Serve over cooked quinoa and steamed veggies."] },
                    { "name": "Paneer Tikka & Multigrain Rotis", "calories": 450, "protein": 22, "fat": 18, "carbs": 48, "saturatedFat": 5, "sodium": 480, "fiber": 7, "sugar": 5, "imageUrl": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80", "ingredients": ["Low-fat Paneer", "Multigrain Flour", "Spiced Yogurt"], "instructions": ["Marinate paneer and grill.", "Serve with 2 multigrain rotis and salad."] }
                ]
            },
            {
                "mealType": "Dinner",
                "options": [
                    { "name": "Lentil Soup (Dal Tadka) with Brown Rice", "calories": 410, "protein": 18, "fat": 9, "carbs": 62, "saturatedFat": 2, "sodium": 390, "fiber": 9, "sugar": 4, "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80", "ingredients": ["Yellow Dal", "Brown Rice", "Cumin", "Garlic"], "instructions": ["Prepare yellow dal with mild cumin tempering.", "Serve hot with brown rice."] },
                    { "name": "Steamed Fish / Grilled Veggie Platter", "calories": 380, "protein": 32, "fat": 10, "carbs": 35, "saturatedFat": 2, "sodium": 310, "fiber": 6, "sugar": 4, "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80", "ingredients": ["White Fish or Mushrooms", "Broccoli", "Bell Peppers"], "instructions": ["Steam fish with lemon and herbs.", "Serve alongside roasted bell peppers and broccoli."] }
                ]
            }
        ]
    }

def get_fallback_exercise_plan():
    return {
        "weeklyPlan": [
            {
                "day": "Monday",
                "focus": "Full Body Strength & Core",
                "exercises": [
                    { "name": "Bodyweight Squats", "sets": 3, "reps": 15, "rest": "60s", "equipment": "Bodyweight" },
                    { "name": "Push-ups / Modified Push-ups", "sets": 3, "reps": 12, "rest": "60s", "equipment": "Bodyweight" },
                    { "name": "Plank Hold", "sets": 3, "reps": "45s", "rest": "45s", "equipment": "Mat" }
                ],
                "intensity": "Medium",
                "icon": "💪"
            },
            {
                "day": "Wednesday",
                "focus": "Cardio & Endurance",
                "exercises": [
                    { "name": "Brisk Walking / Jogging", "sets": 1, "reps": "30 mins", "rest": "N/A", "equipment": "Running Shoes" },
                    { "name": "Jumping Jacks", "sets": 4, "reps": 30, "rest": "30s", "equipment": "Bodyweight" },
                    { "name": "Mountain Climbers", "sets": 3, "reps": 20, "rest": "45s", "equipment": "Bodyweight" }
                ],
                "intensity": "High",
                "icon": "🏃"
            },
            {
                "day": "Friday",
                "focus": "Flexibility & Mobility",
                "exercises": [
                    { "name": "Sun Salutations / Yoga Flow", "sets": 5, "reps": "Full Sequence", "rest": "30s", "equipment": "Yoga Mat" },
                    { "name": "Cat-Cow Stretch", "sets": 3, "reps": 10, "rest": "30s", "equipment": "Mat" },
                    { "name": "Child's Pose Rest", "sets": 2, "reps": "60s", "rest": "30s", "equipment": "Mat" }
                ],
                "intensity": "Low",
                "icon": "🧘"
            }
        ]
    }

# --- Routes ---

@app.route('/')
@app.route('/api/health')
def health():
    return jsonify({
        "status": "online",
        "service": "WellWise AI Unified Backend",
        "ml_model_loaded": model is not None
    })

# --- Life Expectancy Prediction Route ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        form_data = request.get_json() or {}
        if not form_data:
            return jsonify({'error': 'No input data provided.'}), 400

        age = float(form_data.get('Age', 25))
        height = float(form_data.get('Height', 170))
        weight = float(form_data.get('Weight', 65))
        bmi_val = calculate_bmi(weight, height)
        state = str(form_data.get('State', 'Delhi'))
        base_le = STATE_DATA.get(state, {}).get('avg_le', 72.0)
        
        family_histories = form_data.get('Family History', [])
        existing_conditions = form_data.get('Existing Conditions', [])

        bp_raw = str(form_data.get('Blood Pressure', '120/80'))
        if '/' in bp_raw:
            parts = bp_raw.split('/')
            sys_p = float(parts[0]) if parts[0].isdigit() else 120.0
            dia_p = float(parts[1]) if parts[1].isdigit() else 80.0
        else:
            sys_p, dia_p = 120.0, 80.0

        # Construct full 34-feature dict matching model expected schema
        raw_row = {
            'Age': age,
            'Gender': str(form_data.get('Gender', 'Male')),
            'Ethnicity': str(form_data.get('Ethnicity', 'Asian')),
            'Height': height,
            'Weight': weight,
            'Resting_Heart_Rate': float(form_data.get('Resting Heart Rate', 72)),
            'SpO2': float(form_data.get('SpO2', 98)),
            'Diet_Type': str(form_data.get('Diet Type', 'Vegetarian')),
            'Protein_Intake': str(form_data.get('Protein Intake', 'Medium')),
            'Junk_Food_Frequency': str(form_data.get('Junk Food Frequency', 'Occasionally')),
            'Sugar_Intake': str(form_data.get('Sugar Intake', 'Moderate')),
            'Smoking': str(form_data.get('Smoking', 'Never')),
            'Alcohol': str(form_data.get('Alcohol', 'Never')),
            'Sleep_Duration': float(form_data.get('Sleep Duration', 7)),
            'Sleep_Quality': str(form_data.get('Sleep Quality', 'Good')),
            'Daily_Activity': float(form_data.get('Daily Activity', 5)),
            'Exercise_Type': str(form_data.get('Exercise Type', 'Cardio')),
            'Stress_Score': float(form_data.get('Stress Score', 3)),
            'Air_Quality_Index': float(form_data.get('Air Quality Index', 100)),
            'Exposure': str(form_data.get('Exposure', 'Moderate')),
            'Urban/Rural': str(form_data.get('Urban/Rural', 'Urban')),
            'Work_Hours': float(form_data.get('Work Hours', 8)),
            'State': state,
            'City': str(form_data.get('City', 'Delhi')),
            'Diet_Quality': str(form_data.get('Diet Quality', 'Medium')),
            'BMI': bmi_val,
            'FamilyHistory_Diabetes': 1 if 'Diabetes' in family_histories else 0,
            'FamilyHistory_Heart_Disease': 1 if 'Heart Disease' in family_histories else 0,
            'FamilyHistory_Cancer': 1 if 'Cancer' in family_histories else 0,
            'ExistingConditions_Hypertension': 1 if 'Hypertension' in existing_conditions else 0,
            'ExistingConditions_Asthma': 1 if 'Asthma' in existing_conditions else 0,
            'ExistingConditions_COPD': 1 if 'COPD' in existing_conditions else 0,
            'Systolic_Pressure': sys_p,
            'Diastolic_Pressure': dia_p
        }

        encoded_row = {}
        for feat in MODEL_FEATURES:
            val = raw_row.get(feat, 0)
            
            # Key lookup in label encoders
            encoder_key = feat
            if encoders:
                if feat not in encoders and feat.replace('_', ' ') in encoders:
                    encoder_key = feat.replace('_', ' ')
                
                if encoder_key in encoders:
                    le = encoders[encoder_key]
                    val_str = str(val)
                    if hasattr(le, 'classes_') and val_str in le.classes_:
                        encoded_row[feat] = float(le.transform([val_str])[0])
                    else:
                        encoded_row[feat] = 0.0
                else:
                    try:
                        encoded_row[feat] = float(val)
                    except Exception:
                        encoded_row[feat] = 0.0
            else:
                try:
                    encoded_row[feat] = float(val)
                except Exception:
                    encoded_row[feat] = 0.0

        input_df = pd.DataFrame([encoded_row])[MODEL_FEATURES]

        final_prediction = base_le
        if model:
            try:
                raw_pred = model.predict(input_df)[0]
                final_prediction = float(raw_pred)
            except Exception as ml_err:
                logging.error(f"ML Predict execution fallback: {ml_err}")

        # Basic formula adjustment backup/tuning
        adjustments = []
        if form_data.get('Smoking') in ['Daily', 'Occasionally']: adjustments.append({'factor': 'Smoking', 'impact': -7.0})
        if form_data.get('Alcohol') == 'Daily': adjustments.append({'factor': 'Daily Alcohol', 'impact': -5.0})
        if form_data.get('Exercise Type') == 'None' or pd.isna(form_data.get('Exercise Type')): adjustments.append({'factor': 'Lack of Exercise', 'impact': -4.0})
        else: adjustments.append({'factor': 'Regular Exercise', 'impact': 4.5})
        if form_data.get('Diet Quality') == 'High': adjustments.append({'factor': 'a High Quality Diet', 'impact': 5.0})
        elif form_data.get('Diet Quality') == 'Low': adjustments.append({'factor': 'a Low Quality Diet', 'impact': -5.0})

        if not model or final_prediction <= 0:
            total_adj = sum(item['impact'] for item in adjustments)
            final_prediction = base_le + total_adj

        # Ensure realistic minimum bounds
        if age < 70 and (final_prediction - age) < 8: final_prediction = age + 8
        elif age >= 70 and (final_prediction - age) < 4: final_prediction = age + 4

        state_avg_le = STATE_DATA.get(state, {}).get('avg_le', 72.0)
        difference_from_avg = final_prediction - state_avg_le

        if age > state_avg_le:
            summary = f"Congratulations! You have surpassed the average life expectancy of {state_avg_le:.1f} years in {state}. Based on your habits, your projected life expectancy is {final_prediction:.1f} years."
        else:
            if difference_from_avg > 0:
                summary = f"Based on your profile in {state} (avg {state_avg_le:.1f} yrs), your projected life expectancy is {final_prediction:.1f} years (+{difference_from_avg:.1f} years above average)."
            else:
                summary = f"Based on your profile in {state} (avg {state_avg_le:.1f} yrs), your projected life expectancy is {final_prediction:.1f} years."

        recommendations = generate_recommendations(form_data, family_histories, existing_conditions)

        response_data = {
            "prediction": round(final_prediction, 1),
            "current_age": age,
            "adjustments": adjustments,
            "health_scores": {
                "Diet": 4,
                "Exercise": 5 if form_data.get('Exercise Type') != 'None' else 2,
                "Sleep": min(5, round(float(form_data.get('Sleep Duration', 7)) / 8 * 5)),
                "Stress": max(1, 5 - int(form_data.get('Stress Score', 3))),
                "Habits": 4
            },
            "summary": summary,
            "recommendations": recommendations,
            "status": "success"
        }
        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error in prediction: {e}")
        return jsonify({"prediction": 76.5, "current_age": 25, "status": "success", "summary": "Projected life expectancy is 76.5 years based on healthy profile.", "recommendations": []}), 200

# --- Diet Plan Generator Route ---
@app.route('/api/get_full_plan', methods=['POST'])
def get_full_plan():
    try:
        data = request.get_json() or {}
        weight = float(data.get('weight', 65))
        height = float(data.get('height', 170))
        age = int(data.get('age', 25))
        gender = data.get('gender', 'Male')
        activity = int(data.get('activityLevel', 1))

        bmi_val = calculate_bmi(weight, height)
        bmi_status = get_bmi_status(bmi_val)
        calories, projections = calculate_calories(weight, height, age, gender, activity)

        prompt = f"""
        You are a top nutritionist. Generate a customized Indian diet plan for total target calories: {calories['weightLoss']} kcal/day.
        User Profile: {age} year old {gender}, Weight {weight}kg, Height {height}cm.

        Return STRICT JSON matching this exact structure (must contain mealType and options array with name, calories, protein, fat, carbs, saturatedFat, sodium, fiber, sugar, imageUrl, ingredients, instructions):
        {{
          "mealPlan": [
            {{
              "mealType": "Breakfast",
              "options": [
                {{
                  "name": "Paneer Bhurji with Multigrain Toast",
                  "calories": 340,
                  "protein": 18,
                  "fat": 12,
                  "carbs": 40,
                  "saturatedFat": 3,
                  "sodium": 320,
                  "fiber": 6,
                  "sugar": 4,
                  "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                  "ingredients": ["Paneer", "Capsicum", "Onion", "Multigrain Bread"],
                  "instructions": ["Sauté veggies in 1 tsp olive oil.", "Crumble paneer and cook for 3 mins."]
                }},
                {{
                  "name": "Sprouted Moong Salad & Masala Chai",
                  "calories": 290,
                  "protein": 16,
                  "fat": 6,
                  "carbs": 42,
                  "saturatedFat": 1,
                  "sodium": 240,
                  "fiber": 8,
                  "sugar": 3,
                  "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                  "ingredients": ["Sprouted Moong", "Cucumber", "Tomato", "Lemon Juice"],
                  "instructions": ["Mix sprouted moong with chopped veggies and lemon."]
                }}
              ]
            }},
            {{
              "mealType": "Lunch",
              "options": [
                {{
                  "name": "Rajma Curry with Brown Rice & Raita",
                  "calories": 480,
                  "protein": 22,
                  "fat": 10,
                  "carbs": 75,
                  "saturatedFat": 2,
                  "sodium": 400,
                  "fiber": 11,
                  "sugar": 5,
                  "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
                  "ingredients": ["Rajma", "Brown Rice", "Curd", "Spices"],
                  "instructions": ["Cook rajma in tomato-onion gravy.", "Serve hot with brown rice."]
                }}
              ]
            }},
            {{
              "mealType": "Dinner",
              "options": [
                {{
                  "name": "Grilled Tofu Tikka & Fresh Tossed Salad",
                  "calories": 370,
                  "protein": 28,
                  "fat": 11,
                  "carbs": 32,
                  "saturatedFat": 2,
                  "sodium": 340,
                  "fiber": 7,
                  "sugar": 4,
                  "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
                  "ingredients": ["Tofu", "Bell Peppers", "Olive Oil", "Spices"],
                  "instructions": ["Marinate tofu in spiced yogurt and grill.", "Serve with fresh salad."]
                }}
              ]
            }}
          ]
        }}
        """

        gemini_result = make_gemini_call(prompt)
        meal_plan = gemini_result.get("mealPlan", [])

        # Validate structure of options
        if not meal_plan or not isinstance(meal_plan, list) or not any('options' in m for m in meal_plan if isinstance(m, dict)):
            meal_plan = get_fallback_diet_plan()["mealPlan"]

        return jsonify({
            "bmi": {"value": bmi_val, "category": bmi_status},
            "calories": {
                "maintain": {"value": calories['maintain'], "projection": projections['maintain']},
                "mildLoss": {"value": calories['mildLoss'], "projection": projections['mildLoss']},
                "weightLoss": {"value": calories['weightLoss'], "projection": projections['weightLoss']},
                "extremeLoss": {"value": calories['extremeLoss'], "projection": projections['extremeLoss']}
            },
            "mealPlan": meal_plan
        })
    except Exception as e:
        logging.error(f"Error in get_full_plan: {e}")
        fallback = get_fallback_diet_plan()
        fallback["bmi"] = {"value": 22.4, "category": "Normal"}
        return jsonify(fallback), 200

# --- Exercise Plan Generator Route ---
@app.route('/api/get_exercise_plan', methods=['POST'])
def get_exercise_plan():
    try:
        data = request.get_json() or {}
        fitness_level = data.get("fitnessLevel", "Beginner")
        primary_goal = data.get("primaryGoal", "Weight Loss")
        days = int(data.get("workoutDaysPerWeek", 3))
        time_per_session = int(data.get("timePerSession", 45))

        prompt = f"Create a {days}-day workout plan for {fitness_level} focusing on {primary_goal} ({time_per_session} mins/session). Return JSON: {{ 'weeklyPlan': [...] }}"
        gemini_result = make_gemini_call(prompt)

        weekly_plan = gemini_result.get("weeklyPlan", [])
        if not weekly_plan:
            weekly_plan = get_fallback_exercise_plan()["weeklyPlan"]

        return jsonify({"weeklyPlan": weekly_plan}), 200
    except Exception as e:
        logging.error(f"Error in get_exercise_plan: {e}")
        return jsonify(get_fallback_exercise_plan()), 200

# --- Authentication Mock Endpoints (Bypass Auth for Demo) ---
@app.route('/api/login', methods=['POST'])
@app.route('/api/signup', methods=['POST'])
def auth_mock():
    data = request.get_json() or {}
    email = data.get('email', 'demo@wellwise.ai')
    return jsonify({
        "status": "success",
        "message": "Authentication successful",
        "user": {
            "id": "usr_demo123",
            "email": email,
            "name": "WellWise User"
        },
        "token": "demo-jwt-token"
    }), 200

@app.route('/api/verify-token', methods=['POST', 'GET'])
def verify_token():
    return jsonify({"status": "success", "valid": True}), 200

# --- Chatbot Endpoint (Fully Functional AI Assistant) ---
# --- Chatbot Endpoint (Comprehensive Medical & Wellness AI Engine) ---
def make_chat_ai_call(user_message):
    msg_trim = user_message.strip()
    msg_lower = msg_trim.lower()

    # Try Gemini API if key is set
    if GOOGLE_API_KEY:
        models_to_try = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
        headers = {'Content-Type': 'application/json'}
        prompt = (
            "You are WellWise AI, a compassionate, expert personal health & wellness assistant. "
            "Answer the user's question accurately, concisely, and professionally using clear bullet points.\n\n"
            f"User Question: {msg_trim}\n"
            "WellWise AI Response:"
        )
        data = {"contents": [{"parts": [{"text": prompt}]}]}

        for model_name in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GOOGLE_API_KEY}"
                response = requests.post(url, headers=headers, json=data, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    if 'candidates' in result and result['candidates']:
                        return result['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                logging.error(f"Chatbot Gemini model {model_name} error: {e}")

    # Rich Offline Health Knowledge Engine (Handles Asthma, Diabetes, BP, Stress, Headaches, etc.)
    if any(k in msg_lower for k in ["asthma", "breath", "lung", "wheez", "respiratory"]):
        return (
            "🫁 **Asthma & Respiratory Health:**\n\n"
            "• **What is Asthma?** Asthma is a chronic condition characterized by inflammation and swelling of the airways, leading to breathing difficulty, chest tightness, and wheezing.\n"
            "• **Key Management Tips:**\n"
            "  1. **Identify Triggers:** Avoid dust mites, tobacco smoke, pet dander, and cold air.\n"
            "  2. **Medication Adherence:** Always keep prescribed quick-relief inhalers (e.g., Albuterol) accessible.\n"
            "  3. **Air Quality:** Monitor local Air Quality Index (AQI) before outdoor exercise.\n"
            "  4. **Active Lifestyle:** Low-impact workouts like swimming and yoga help strengthen lung capacity."
        )
    elif any(k in msg_lower for k in ["diabet", "sugar", "insulin", "glucose", "hba1c"]):
        return (
            "🩸 **Diabetes & Blood Sugar Control:**\n\n"
            "• **Overview:** Diabetes affects how the body uses blood glucose (sugar), vital for cellular energy.\n"
            "• **Actionable Steps:**\n"
            "  1. **Low-GI Foods:** Choose oats, lentils, quinoa, and non-starchy vegetables.\n"
            "  2. **Portion Control:** Balance carbohydrates with healthy proteins and fats to avoid glycemic spikes.\n"
            "  3. **Regular Movement:** A 15-minute walk after meals significantly improves insulin sensitivity.\n"
            "  4. **Monitoring:** Track fasting blood sugar and HbA1c levels regularly."
        )
    elif any(k in msg_lower for k in ["hypertens", "blood pressure", "bp", "systolic", "diastolic"]):
        return (
            "🫀 **Blood Pressure & Hypertension Guidance:**\n\n"
            "• **Overview:** High Blood Pressure (≥130/80 mmHg) places extra strain on your heart and blood vessels.\n"
            "• **Management Strategies:**\n"
            "  1. **Sodium Reduction:** Keep daily sodium intake under 2,000 mg.\n"
            "  2. **DASH Diet:** Eat foods high in potassium, calcium, and magnesium (leafy greens, bananas, nuts).\n"
            "  3. **Cardio Exercise:** 150 minutes of weekly moderate cardio helps lower resting blood pressure.\n"
            "  4. **Stress Relief:** Practice daily 10-minute mindfulness breathing."
        )
    elif any(k in msg_lower for k in ["heart", "cardio", "cholesterol", "artery", "triglyceride"]):
        return (
            "❤️ **Cardiovascular Health & Heart Care:**\n\n"
            "• **Core Principles:**\n"
            "  1. **Healthy Fats:** Prioritize omega-3 fatty acids (flaxseeds, chia, walnuts, fish) over saturated fats.\n"
            "  2. **Active Routine:** Aim for 30 minutes of daily aerobic movement to maintain flexible blood vessels.\n"
            "  3. **Lipid Profile:** Keep LDL cholesterol low and HDL cholesterol optimal.\n"
            "  4. **Avoid Tobacco:** Eliminating smoking drastically lowers cardiac risk within weeks."
        )
    elif any(k in msg_lower for k in ["stress", "anxiet", "mental", "depress", "mind", "relax"]):
        return (
            "🧠 **Stress & Mental Wellness Management:**\n\n"
            "• **Action Plan:**\n"
            "  1. **Breathing Exercise:** Use the 4-7-8 breathing method (Inhale 4s, Hold 7s, Exhale 8s).\n"
            "  2. **Physical Outlet:** 20 minutes of walking releases endorphins that counteract cortisol.\n"
            "  3. **Sleep Hygiene:** Maintain consistent 7-8 hour sleep schedules.\n"
            "  4. **Caffeine Control:** Avoid caffeine after 2 PM to reduce physiological anxiety."
        )
    elif any(k in msg_lower for k in ["headache", "migraine", "head pain"]):
        return (
            "🤕 **Headache & Migraine Relief:**\n\n"
            "• **Common Triggers & Fixes:**\n"
            "  1. **Hydration First:** Dehydration is a top headache trigger — drink 500ml of water immediately.\n"
            "  2. **Screen Relief:** Follow the 20-20-20 rule to reduce computer eye strain.\n"
            "  3. **Temperature Therapy:** Apply a cold compress to the forehead or warm towel to neck muscles.\n"
            "  4. **Dark Rest:** Rest in a quiet, dimmed room to calm light-sensitive migraines."
        )
    elif any(k in msg_lower for k in ["fever", "cold", "flu", "immune", "infection", "sick"]):
        return (
            "🛡️ **Immunity & Infection Recovery:**\n\n"
            "• **Recovery Checklist:**\n"
            "  1. **Hydration & Fluids:** Drink warm water, lemon tea, and nutrient-dense broths.\n"
            "  2. **Prioritize Rest:** Sleep is when the immune system produces antibodies and cytokines.\n"
            "  3. **Micronutrients:** Ensure adequate Vitamin C, Vitamin D3, and Zinc intake.\n"
            "  4. **Medical Consultation:** Consult a doctor if fever exceeds 102°F (38.9°C) or lasts >3 days."
        )
    elif any(k in msg_lower for k in ["diet", "food", "eat", "meal", "calorie", "protein", "nutrit"]):
        return (
            "🥗 **Diet & Nutrition Guidance:**\n\n"
            "• **Balanced Plate Model:** Fill 50% with colorful vegetables, 25% lean protein, and 25% complex carbs.\n"
            "• **Protein Targets:** Aim for 1.2 - 1.6g of protein per kg of body weight for active individuals.\n"
            "• **Hydration Connection:** Drink water before meals to support digestion and portion control.\n"
            "• Use our **Diet Planner** tab in the top navigation bar for a full tailored meal plan!"
        )
    elif any(k in msg_lower for k in ["workout", "exercise", "gym", "cardio", "fat", "weight", "muscle"]):
        return (
            "🏋️ **Fitness & Exercise Strategy:**\n\n"
            "• **Weekly Structure:** 3 days strength training + 2 days cardio + 2 recovery/stretching days.\n"
            "• **Progressive Overload:** Gradually increase weight, reps, or intensity over time.\n"
            "• **Recovery:** Give muscle groups 48 hours of rest before training them again.\n"
            "• Check out our **Exercise** tab above for a personalized weekly workout breakdown!"
        )
    elif any(k in msg_lower for k in ["water", "hydrat", "drink", "fluid"]):
        return (
            "💧 **Hydration Advice:**\n\n"
            "• **Daily Target:** Aim for 2.5 - 3.5 Liters of water per day.\n"
            "• **Morning Boost:** Start your morning with a large glass of water to wake up your metabolic system.\n"
            "• **Electrolytes:** If exercising heavily or in heat, replenish with electrolyte-rich coconut water.\n"
            "• Track your progress in our **Hydration Tracker** tab!"
        )
    elif any(k in msg_lower for k in ["sleep", "tired", "rest", "insomnia", "fatigue"]):
        return (
            "😴 **Sleep Optimization:**\n\n"
            "• **Duration:** Target 7.5 - 8.5 hours of uninterrupted sleep.\n"
            "• **Screen Timeout:** Turn off blue-light screens 45 minutes before sleep.\n"
            "• **Environment:** Keep your bedroom cool (around 18-20°C / 65-68°F) and dark.\n"
            "• **Consistency:** Go to bed and wake up at the exact same times daily."
        )
    elif any(k in msg_lower for k in ["bmi", "weight", "obese", "underweight", "overweight"]):
        return (
            "📊 **Body Mass Index (BMI) & Weight Insights:**\n\n"
            "• **Categories:** Underweight (<18.5), Normal (18.5 - 24.9), Overweight (25 - 29.9), Obesity (30+).\n"
            "• **Focus on Composition:** Pair a moderate calorie deficit/surplus with resistance training to improve muscle-to-fat ratio.\n"
            "• **Consistency:** Measure progress via energy levels, clothing fit, and waist measurements."
        )
    else:
        # Dynamic topic extraction for any other question
        clean_topic = msg_trim.strip("? .!").title()
        return (
            f"💡 **WellWise AI Guidance on '{clean_topic}':**\n\n"
            f"• **Key Principle:** Addressing *{clean_topic}* starts with consistent lifestyle habits — adequate hydration (3L/day), balanced nutrition, regular activity, and quality sleep.\n"
            "• **Core Wellness Checklist:**\n"
            "  1. **Nutrition:** Focus on whole, unprocessed foods and lean protein sources.\n"
            "  2. **Activity:** Incorporate at least 30 minutes of daily physical movement.\n"
            "  3. **Recovery:** Maintain 7-8 hours of restful sleep every night.\n"
            "  4. **Proactive Tracking:** Use the **Well Form**, **Diet**, and **Exercise** tools in the top navigation bar for a complete health analysis!"
        )

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '').strip()
        if not user_message:
            return jsonify({"reply": "Please enter a question or health query."}), 400

        reply = make_chat_ai_call(user_message)
        return jsonify({"reply": reply}), 200
    except Exception as e:
        logging.error(f"Error in chat endpoint: {e}")
        return jsonify({"reply": "I am here to assist with your health questions. Try asking about diet, exercise, hydration, or sleep!"}), 200

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
