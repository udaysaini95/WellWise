from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
import json

# File to save user submissions
USER_DATA_FILE = "user_data.txt"


# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)  # ✅ ADDED: Allow all cross-origin requests for network access

# --- Define lists for one-hot encoding (must match training script v15) ---
ALL_FAMILY_HISTORIES = ['Diabetes', 'Heart Disease', 'Cancer']
ALL_EXISTING_CONDITIONS = ['Hypertension', 'Asthma', 'COPD']

# --- Complete State-Specific Data for Narrative Summary ---
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

# --- Load the final v15 Model and Encoders ---
try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'models', 'life_expectancy_model_v15.pkl')
    encoders_path = os.path.join(script_dir, 'models', 'label_encoders_v15.pkl')
    model = joblib.load(model_path)
    encoders = joblib.load(encoders_path)
    print("✅ Final multi-condition model (v15) loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Model v15 files not found. Please ensure they are in the 'models' folder.")
    model = None
    encoders = None

def generate_recommendations(data, family_histories, existing_conditions):
    recommendations = []
    if data.get('Smoking') in ['Daily', 'Occasionally']:
        recommendations.append({'title': 'Address Smoking Habit', 'text': 'Quitting smoking is the single most impactful change you can make. It could potentially add up to <strong>7 years</strong> to your life expectancy.'})
    if data.get('Diet Quality') == 'Low':
        recommendations.append({'title': 'Improve Your Diet Quality', 'text': 'Improving your diet by reducing junk food and sugar could shift your life expectancy by up to <strong>12 years</strong>.'})
    if data.get('Exercise Type') == 'None':
        recommendations.append({'title': 'Introduce Regular Exercise', 'text': 'Incorporating regular activity could extend your lifespan by up to <strong>9 years</strong> compared to being sedentary.'})
    if 'Heart Disease' in family_histories or 'Hypertension' in existing_conditions:
          recommendations.append({'title': 'Focus on Cardiovascular Health', 'text': 'With a predisposition to heart-related issues, focusing on a heart-healthy diet low in sodium and saturated fats is highly recommended.'})
    
    if not recommendations:
        recommendations.append({
            'title': 'Keep Up the Great Work!',
            'text': 'Your current lifestyle choices are setting you up for a long, healthy life. Continue to focus on a balanced diet, regular exercise, and stress management. Consider regular health check-ups to stay proactive.'
        })

    return sorted(recommendations, key=lambda x: x.get('potential_gain', 0), reverse=True)

@app.route('/')
def home():
    # Provide a simple JSON response to confirm the API is running
    return jsonify({"status": "success", "message": "Life Expectancy Prediction API is running."})

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not encoders:
        return jsonify({'error': 'Model not loaded.'}), 500

    try:
        # This API will only accept JSON data
        form_data = request.get_json()
        # --- Save user submission to text file ---
        submission = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "data": form_data
        }
        with open(USER_DATA_FILE, "a") as f:
            f.write(json.dumps(submission) + "\n")
        # ---------------------------------------

        if not form_data:
            return jsonify({'error': 'Invalid JSON or no data received.'}), 400

        family_histories = form_data.get('Family History', [])
        existing_conditions = form_data.get('Existing Conditions', [])
        
        numeric_fields = ['Age', 'Height', 'Weight', 'BMI', 'Resting Heart Rate', 'SpO2', 'Sleep Duration', 'Daily Activity', 'Stress Score', 'Air Quality Index', 'Work Hours']
        for field in numeric_fields:
            if form_data.get(field): form_data[field] = pd.to_numeric(form_data[field])

        input_df = pd.DataFrame([form_data])
        
        cols_to_map_none = ['Exercise Type']
        for col in cols_to_map_none:
            if col in input_df.columns:
                input_df.loc[input_df[col] == 'None', col] = np.nan
        
        for h in ALL_FAMILY_HISTORIES:
            input_df[f'FamilyHistory_{h}'] = 1 if h in family_histories else 0
        for c in ALL_EXISTING_CONDITIONS:
            input_df[f'ExistingConditions_{c}'] = 1 if c in existing_conditions else 0

        if 'Blood Pressure' in input_df.columns:
            bp_series = input_df.pop('Blood Pressure')
            bp_split = bp_series.str.split('/', expand=True)
            input_df['Systolic_Pressure'] = pd.to_numeric(bp_split[0])
            input_df['Diastolic_Pressure'] = pd.to_numeric(bp_split[1])
        
        input_df = input_df.drop(columns=['Family History', 'Existing Conditions'], errors='ignore')

        for col, le in encoders.items():
            if col in input_df.columns: 
                try:
                    input_df[col] = le.transform(input_df[col])
                except Exception as e:
                    valid_labels = [str(label) for label in le.classes_]
                    error_msg = f"Error encoding column '{col}': Value '{input_df[col].iloc[0]}' not recognized. Valid options: {valid_labels}."
                    return jsonify({'error': error_msg}), 400
        
        state = form_data.get('State', 'Delhi')
        base_le = STATE_DATA.get(state, {}).get('avg_le', 72.0)
        
        adjustments = []
        if form_data.get('Smoking') in ['Daily', 'Occasionally']: adjustments.append({'factor': 'Smoking', 'impact': -7.0})
        if form_data.get('Alcohol') == 'Daily': adjustments.append({'factor': 'Daily Alcohol', 'impact': -5.0})
        if form_data.get('Exercise Type') == 'None' or pd.isna(form_data.get('Exercise Type')): adjustments.append({'factor': 'Lack of Exercise', 'impact': -4.0})
        else: adjustments.append({'factor': 'Regular Exercise', 'impact': 4.5})
        if form_data.get('Diet Quality') == 'High': adjustments.append({'factor': 'a High Quality Diet', 'impact': 5.0})
        elif form_data.get('Diet Quality') == 'Low': adjustments.append({'factor': 'a Low Quality Diet', 'impact': -5.0})
        
        total_adjustment = sum(item['impact'] for item in adjustments)
        formula_le = base_le + total_adjustment

        raw_model_prediction = model.predict(input_df)[0]
        model_adjustment = max(-5, min(5, (raw_model_prediction - formula_le) * 0.2))
        tuned_prediction = formula_le + model_adjustment
        
        current_age = form_data['Age']
        final_prediction = tuned_prediction
        if current_age < 70 and (final_prediction - current_age) < 8: final_prediction = current_age + 8
        elif current_age >= 70 and (final_prediction - current_age) < 4: final_prediction = current_age + 4
        
        state_avg_le = STATE_DATA.get(state, {}).get('avg_le', 72.0)
        difference_from_avg = final_prediction - state_avg_le
        years_from_current = final_prediction - current_age

        if current_age > state_avg_le:
            summary = (f"Congratulations! You have already surpassed the average life expectancy of {state_avg_le:.1f} years in {state}. "
                       f"Based on your current lifestyle, you are on track to live up to {final_prediction:.1f} years, "
                       f"which is {difference_from_avg:.1f} more years than the average and about {years_from_current:.1f} years from your current age.")
        else:
            summary_start = f"Based on your location in {state}, the average life expectancy is around {state_avg_le:.1f} years. "
            if difference_from_avg < -1:
                years_less = abs(difference_from_avg)
                negative_factors = [adj['factor'].replace('a ', '') for adj in adjustments if adj['impact'] < 0]
                factor_string = f" primarily due to factors like {', and '.join(negative_factors)}" if negative_factors else ""
                summary = summary_start + f"You are on track to live {years_less:.1f} fewer years than the average{factor_string}."
            elif difference_from_avg > 1:
                years_more = difference_from_avg
                positive_factors = [adj['factor'].replace('a ', '') for adj in adjustments if adj['impact'] > 0]
                factor_string = f" This is largely thanks to positive choices like {', and '.join(positive_factors)}" if positive_factors else ""
                summary = summary_start + f"You are on track to live {years_more:.1f} more years than the average.{factor_string}."
            else:
                summary = summary_start + f"Your predicted life expectancy of {final_prediction:.1f} years is in line with the regional average."
        
        recommendations = generate_recommendations(form_data, family_histories, existing_conditions)
        
        response_data = {
            "prediction": round(final_prediction, 1), "current_age": current_age, "adjustments": adjustments,
            "health_scores": {
                "Diet": 5 - (['Low', 'Medium', 'High'].index(form_data.get('Diet Quality')) * 2),
                "Exercise": 5 if form_data.get('Exercise Type') != 'None' and not pd.isna(form_data.get('Exercise Type')) else 1,
                "Sleep": form_data.get('Sleep Duration', 0) / 9 * 5,
                "Stress": 6 - (form_data.get('Stress Score', 0) / 2),
                "Habits": 5 - (['Never', 'Occasionally', 'Daily'].index(form_data.get('Smoking'))) - (['Never', 'Occasionally', 'Daily'].index(form_data.get('Alcohol')))
            },
            "summary": summary, "recommendations": recommendations, "status": "success"
        }

        # ✅ CHANGED: Always return JSON, never render a template
        return jsonify(response_data)

    except Exception as e:
        # Provide a more detailed error log for debugging
        print(f"❌ An error occurred during prediction: {e}")
        return jsonify({'error': f"An unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    # ✅ CHANGED: Use host='0.0.0.0' to make it accessible on your network
    app.run(host='0.0.0.0', port=5000, debug=True)