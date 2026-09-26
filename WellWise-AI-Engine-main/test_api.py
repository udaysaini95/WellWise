import requests
import json

# The URL where your Flask API is running
API_URL = "http://127.0.0.1:5000/predict"

# --- Define Multiple Test Cases for the v15 Model ---

# Test Case 1: A very healthy individual
healthy_profile = {
    "Age": 35, "Gender": "Female", "Ethnicity": "South Indian", "Height": 165, "Weight": 60,
    "BMI": 22.0, "Blood Pressure": "115/75", "Resting Heart Rate": 60, "SpO2": 99,
    "Diet Type": "Vegetarian", "Protein Intake": "High", "Junk Food Frequency": "Never",
    "Sugar Intake": "Low", "Diet Quality": "High", "Smoking": "Never", "Alcohol": "Never",
    "Sleep Duration": 8.5, "Sleep Quality": "Good", "Daily Activity": 12000,
    "Exercise Type": "Yoga", "Stress Score": 2, "Air Quality Index": 80, "Exposure": "Low",
    "Urban/Rural": "Urban", "Work Hours": 8, "State": "Kerala", "City": "Kochi",
    "Family History": [], "Existing Conditions": [] # Correctly sent as empty lists
}

# Test Case 2: An individual with high-risk factors and multiple conditions
high_risk_profile = {
    "Age": 55, "Gender": "Male", "Ethnicity": "North Indian", "Height": 175, "Weight": 95,
    "BMI": 31.0, "Blood Pressure": "150/95", "Resting Heart Rate": 85, "SpO2": 95,
    "Diet Type": "Non-Vegetarian", "Protein Intake": "Low", "Junk Food Frequency": "High",
    "Sugar Intake": "High", "Diet Quality": "Low", "Smoking": "Daily", "Alcohol": "Daily",
    "Sleep Duration": 5.5, "Sleep Quality": "Poor", "Daily Activity": 2500,
    "Exercise Type": "None", "Stress Score": 9, "Air Quality Index": 250, "Exposure": "High",
    "Urban/Rural": "Urban", "Work Hours": 11, "State": "Delhi", "City": "Delhi",
    "Family History": ["Heart Disease", "Diabetes"], "Existing Conditions": ["Hypertension"]
}

# Test Case 3: An average, middle-aged individual with 'Other' gender
average_profile = {
    "Age": 48, "Gender": "Other", "Ethnicity": "Gujarati", "Height": 170, "Weight": 78,
    "BMI": 27.0, "Blood Pressure": "130/85", "Resting Heart Rate": 72, "SpO2": 97,
    "Diet Type": "Vegetarian", "Protein Intake": "Medium", "Junk Food Frequency": "Medium",
    "Sugar Intake": "Medium", "Diet Quality": "Medium", "Smoking": "Occasionally", "Alcohol": "Occasionally",
    "Sleep Duration": 7.0, "Sleep Quality": "Average", "Daily Activity": 6000,
    "Exercise Type": "Walking", "Stress Score": 6, "Air Quality Index": 160, "Exposure": "Medium",
    "Urban/Rural": "Urban", "Work Hours": 9, "State": "Gujarat", "City": "Ahmedabad",
    "Family History": [], "Existing Conditions": []
}

# Test Case 4: An elderly individual with a single condition
elderly_profile = {
    "Age": 75, "Gender": "Female", "Ethnicity": "Bengali", "Height": 155, "Weight": 65,
    "BMI": 27.1, "Blood Pressure": "140/88", "Resting Heart Rate": 78, "SpO2": 96,
    "Diet Type": "Mixed", "Protein Intake": "Medium", "Junk Food Frequency": "Low",
    "Sugar Intake": "Low", "Diet Quality": "Medium", "Smoking": "Never", "Alcohol": "Never",
    "Sleep Duration": 6.5, "Sleep Quality": "Average", "Daily Activity": 4000,
    "Exercise Type": "Walking", "Stress Score": 4, "Air Quality Index": 180, "Exposure": "Medium",
    "Urban/Rural": "Urban", "Work Hours": 6, "State": "West Bengal", "City": "Kolkata",
    "Family History": ["Diabetes"], "Existing Conditions": []
}


# --- Function to run a single test ---
def run_test(profile_name, user_data):
    """Sends a single profile to the API and prints the results."""
    print(f"\n{'='*20} Testing: {profile_name.replace('_', ' ').title()} {'='*20}")
    
    headers = { "Content-Type": "application/json" }
    
    try:
        response = requests.post(API_URL, headers=headers, json=user_data)

        if response.status_code == 200:
            prediction_data = response.json()
            print("\n✅ Prediction Received Successfully!")
            print("-----------------------------------------")
            
            life_expectancy = prediction_data.get('prediction')
            print(f"  Predicted Life Expectancy: {life_expectancy} years")
            
            if 'summary' in prediction_data:
                print("\n  Summary:")
                print(f"  \"{prediction_data['summary']}\"")
            
            if 'adjustments' in prediction_data and prediction_data['adjustments']:
                print("\n  Key Contributing Factors (from Rule-Based Model):")
                
                positive = [adj for adj in prediction_data['adjustments'] if adj['impact'] > 0]
                negative = [adj for adj in prediction_data['adjustments'] if adj['impact'] < 0]

                if positive:
                    print("    (+) Positive Impacts:")
                    for item in positive:
                        print(f"      - {item['factor']}: +{item['impact']} years")
                
                if negative:
                    print("    (-) Negative Impacts:")
                    for item in negative:
                        print(f"      - {item['factor']}: {item['impact']} years")

            if 'recommendations' in prediction_data:
                print("\n  Recommendations:")
                for rec in prediction_data['recommendations']:
                    print(f"    - {rec['title']}")

            print("-----------------------------------------")
        else:
            print(f"\n❌ Error: The server returned status code {response.status_code}")
            print(f"   Response from server: {response.json()}")

    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Could not connect to the server.")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")


# --- Main execution block ---
if __name__ == '__main__':
    all_tests = {
        "Healthy Profile": healthy_profile,
        "High-Risk Profile": high_risk_profile,
        "Average Profile": average_profile,
        "Elderly Profile": elderly_profile
    }

    for name, data in all_tests.items():
        run_test(name, data)

