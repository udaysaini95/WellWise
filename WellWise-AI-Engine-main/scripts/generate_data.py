import pandas as pd
import numpy as np
import random
import os

# --- State-Specific Health & Demographic Data ---
STATE_DATA = {
    'Andhra Pradesh': {'avg_le': 70.0, 'avg_aqi': 120, 'median_age': 27, 'cities': ['Visakhapatnam', 'Vijayawada', 'Tirupati']},
    'Arunachal Pradesh': {'avg_le': 70.3, 'avg_aqi': 40, 'median_age': 24, 'cities': ['Itanagar', 'Naharlagun']},
    'Assam': {'avg_le': 67.2, 'avg_aqi': 150, 'median_age': 25, 'cities': ['Guwahati', 'Dibrugarh', 'Silchar']},
    'Bihar': {'avg_le': 69.5, 'avg_aqi': 180, 'median_age': 20, 'cities': ['Patna', 'Gaya', 'Bhagalpur']},
    'Chhattisgarh': {'avg_le': 68.9, 'avg_aqi': 140, 'median_age': 23, 'cities': ['Raipur', 'Bhilai', 'Bilaspur']},
    'Goa': {'avg_le': 74.5, 'avg_aqi': 70, 'median_age': 32, 'cities': ['Panaji', 'Margao']},
    'Gujarat': {'avg_le': 72.8, 'avg_aqi': 160, 'median_age': 27, 'cities': ['Ahmedabad', 'Surat', 'Vadodara']},
    'Haryana': {'avg_le': 72.3, 'avg_aqi': 190, 'median_age': 26, 'cities': ['Faridabad', 'Gurugram', 'Chandigarh']},
    'Himachal Pradesh': {'avg_le': 74.6, 'avg_aqi': 80, 'median_age': 29, 'cities': ['Shimla', 'Dharamshala']},
    'Jharkhand': {'avg_le': 69.4, 'avg_aqi': 150, 'median_age': 22, 'cities': ['Ranchi', 'Jamshedpur', 'Dhanbad']},
    'Karnataka': {'avg_le': 72.8, 'avg_aqi': 100, 'median_age': 28, 'cities': ['Bengaluru', 'Mysore', 'Mangalore']},
    'Kerala': {'avg_le': 77.8, 'avg_aqi': 60, 'median_age': 33, 'cities': ['Thiruvananthapuram', 'Kochi', 'Kozhikode']},
    'Madhya Pradesh': {'avg_le': 69.4, 'avg_aqi': 130, 'median_age': 24, 'cities': ['Indore', 'Bhopal', 'Gwalior']},
    'Maharashtra': {'avg_le': 73.6, 'avg_aqi': 110, 'median_age': 29, 'cities': ['Mumbai', 'Pune', 'Nagpur']},
    'Manipur': {'avg_le': 75.0, 'avg_aqi': 50, 'median_age': 24, 'cities': ['Imphal']},
    'Meghalaya': {'avg_le': 72.7, 'avg_aqi': 60, 'median_age': 21, 'cities': ['Shillong']},
    'Mizoram': {'avg_le': 74.3, 'avg_aqi': 30, 'median_age': 23, 'cities': ['Aizawl']},
    'Nagaland': {'avg_le': 73.4, 'avg_aqi': 50, 'median_age': 23, 'cities': ['Kohima', 'Dimapur']},
    'Odisha': {'avg_le': 69.8, 'avg_aqi': 140, 'median_age': 26, 'cities': ['Bhubaneswar', 'Cuttack', 'Rourkela']},
    'Punjab': {'avg_le': 74.4, 'avg_aqi': 170, 'median_age': 29, 'cities': ['Ludhiana', 'Amritsar']},
    'Rajasthan': {'avg_le': 70.8, 'avg_aqi': 160, 'median_age': 24, 'cities': ['Jaipur', 'Jodhpur', 'Udaipur']},
    'Sikkim': {'avg_le': 73.5, 'avg_aqi': 70, 'median_age': 25, 'cities': ['Gangtok']},
    'Tamil Nadu': {'avg_le': 73.8, 'avg_aqi': 90, 'median_age': 30, 'cities': ['Chennai', 'Coimbatore', 'Madurai']},
    'Telangana': {'avg_le': 72.7, 'avg_aqi': 110, 'median_age': 27, 'cities': ['Hyderabad', 'Warangal']},
    'Tripura': {'avg_le': 74.6, 'avg_aqi': 100, 'median_age': 26, 'cities': ['Agartala']},
    'Uttar Pradesh': {'avg_le': 68.7, 'avg_aqi': 200, 'median_age': 22, 'cities': ['Lucknow', 'Kanpur', 'Ghaziabad']},
    'Uttarakhand': {'avg_le': 73.5, 'avg_aqi': 120, 'median_age': 25, 'cities': ['Dehradun', 'Haridwar']},
    'West Bengal': {'avg_le': 72.8, 'avg_aqi': 160, 'median_age': 28, 'cities': ['Kolkata', 'Siliguri', 'Darjeeling']},
    'Delhi': {'avg_le': 75.3, 'avg_aqi': 250, 'median_age': 29, 'cities': ['Delhi']}
}
ALL_FAMILY_HISTORIES = ['Diabetes', 'Heart Disease', 'Cancer']
ALL_EXISTING_CONDITIONS = ['Hypertension', 'Asthma', 'COPD']

def calculate_diet_quality(row):
    score = 0
    if row['Protein Intake'] == 'High': score += 2
    elif row['Protein Intake'] == 'Low': score -= 2
    if row['Junk Food Frequency'] == 'Never': score += 2
    elif row['Junk Food Frequency'] == 'High': score -= 2
    if row['Sugar Intake'] == 'Low': score += 2
    elif row['Sugar Intake'] == 'High': score -= 2
    if score >= 3: return 'High'
    elif score <= -3: return 'Low'
    else: return 'Medium'

def calculate_logical_le(row, state_avg_le):
    base_le = state_avg_le

    if row['Gender'] == 'Female':
        base_le += 4

    if row['Smoking'] in ['Daily', 'Occasionally']: base_le -= 7
    if row['Alcohol'] == 'Daily': base_le -= 5
    if row['Exercise Type'] != 'None': base_le += 5
    else: base_le -= 4
    if row['Diet Quality'] == 'High': base_le += 6
    elif row['Diet Quality'] == 'Low': base_le -= 6
    if row['Sleep Duration'] < 6.5 or row['Sleep Duration'] > 9.5:
        base_le -= 3
    if row['Stress Score'] > 7: base_le -= 4
    if row['BMI'] > 30: base_le -= (row['BMI'] - 30) * 0.5
    
    for condition in ALL_FAMILY_HISTORIES:
        if row[f'FamilyHistory_{condition}'] == 1:
            base_le -= 2.5 
    for condition in ALL_EXISTING_CONDITIONS:
        if row[f'ExistingConditions_{condition}'] == 1:
            base_le -= 3.0

    base_le += random.uniform(-2, 2)
    
    # --- FINAL, GRANULAR, AGE-DEPENDENT FAIL-SAFE LOGIC ---
    age = row['Age']
    if age < 40:
        # For young adults, allow low LE for bad habits, but not absurdly low.
        return max(base_le, 50)
    elif age < 60:
        # For middle-aged adults, ensure a reasonable buffer.
        return max(base_le, age + 10)
    elif age < 80:
        return max(base_le, age + 7)
    elif age < 90:
        return max(base_le, age + 5)
    else: # age >= 90
        return max(base_le, age + 3)

def generate_health_data(num_records=100000):
    print(f"Generating {num_records} records with one-hot encoding...")
    data = []
    num_elderly = int(num_records * 0.01)
    
    for i in range(num_records):
        state = random.choice(list(STATE_DATA.keys()))
        state_info = STATE_DATA[state]
        
        if i < num_elderly:
            age = random.randint(85, 98)
        else:
            age = max(18, int(random.gauss(state_info['median_age'], 5)))

        sleep_quality = random.choice(['Good', 'Average', 'Poor'])
        if sleep_quality == 'Good': sleep_duration = round(random.uniform(7.0, 9.0), 1)
        elif sleep_quality == 'Poor':
            sleep_duration = round(random.uniform(5.0, 6.4), 1) if random.random() > 0.5 else round(random.uniform(9.6, 11.0), 1)
        else:
            sleep_duration = round(random.uniform(6.5, 6.9), 1) if random.random() > 0.5 else round(random.uniform(9.1, 9.5), 1)
        
        row = {
            'Age': age, 'Gender': random.choice(['Male', 'Female', 'Other']),
            'Ethnicity': random.choice(['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Punjabi']),
            'Height': random.randint(150, 190), 'Weight': random.randint(45, 100),
            'Blood Pressure': f"{random.randint(110, 160)}/{random.randint(70, 100)}", 'Resting Heart Rate': random.randint(60, 100),
            'SpO2': random.randint(94, 100), 'Diet Type': random.choice(['Non-Vegetarian', 'Vegetarian', 'Vegan', 'Mixed']),
            'Protein Intake': random.choice(['High', 'Medium', 'Low']), 'Junk Food Frequency': random.choice(['High', 'Medium', 'Low', 'Never']),
            'Sugar Intake': random.choice(['High', 'Medium', 'Low']), 'Smoking': random.choice(['Never', 'Occasionally', 'Daily']),
            'Alcohol': random.choice(['Never', 'Occasionally', 'Daily']), 
            'Sleep Duration': sleep_duration, 'Sleep Quality': sleep_quality,
            'Daily Activity': random.randint(1000, 10000), 'Exercise Type': random.choice(['Gym', 'Walking', 'Yoga', 'None']), 
            'Stress Score': random.randint(1, 10),
            'Air Quality Index': max(20, int(random.gauss(state_info['avg_aqi'], 30))), 'Exposure': random.choice(['Low', 'Medium', 'High']),
            'Urban/Rural': random.choice(['Urban', 'Rural']), 'Work Hours': random.randint(4, 10),
            'State': state, 'City': random.choice(state_info['cities'])
        }
        
        row['Diet Quality'] = calculate_diet_quality(row)
        row['BMI'] = round(row['Weight'] / ((row['Height'] / 100) ** 2), 1)

        selected_histories = random.sample(ALL_FAMILY_HISTORIES, k=random.randint(0, 2))
        for h in ALL_FAMILY_HISTORIES: row[f'FamilyHistory_{h}'] = 1 if h in selected_histories else 0
            
        selected_conditions = random.sample(ALL_EXISTING_CONDITIONS, k=random.randint(0, 2))
        for c in ALL_EXISTING_CONDITIONS: row[f'ExistingConditions_{c}'] = 1 if c in selected_conditions else 0

        row['Life Expectancy'] = round(calculate_logical_le(row, state_info['avg_le']), 1)
        data.append(row)
        
    df = pd.DataFrame(data)
    print("Data generation complete.")
    return df

if __name__ == '__main__':
    new_data = generate_health_data(num_records=100000)
    output_path = '../data/wellwise_health_data_v15_final.csv'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    new_data.to_csv(output_path, index=False)
    print(f"✅ Final dataset with granular age logic saved to '{output_path}'")

