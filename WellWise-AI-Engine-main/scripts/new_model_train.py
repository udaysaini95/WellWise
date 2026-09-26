import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import lightgbm as lgb
import joblib
import os

# --- Get the absolute path of the directory where the script is located ---
script_dir = os.path.dirname(os.path.abspath(__file__))

# --- 1. Load the Final, High-Quality Dataset ---
print("Loading the final multi-condition dataset (v15)...")
csv_path = os.path.join(script_dir, '..', 'data', 'wellwise_health_data_v15_final.csv')
try:
    df = pd.read_csv(csv_path)
    print("Data loaded successfully.")
except FileNotFoundError:
    print(f"ERROR: Dataset not found at '{csv_path}'. Please run the data generation script first.")
    exit()

# --- 2. Data Cleaning: Process Blood Pressure ---
print("Cleaning 'Blood Pressure' column...")
bp_split = df['Blood Pressure'].str.split('/', expand=True)
df['Systolic_Pressure'] = pd.to_numeric(bp_split[0])
df['Diastolic_Pressure'] = pd.to_numeric(bp_split[1])
df = df.drop(columns=['Blood Pressure'])
print("Blood pressure processed successfully.")

# --- 3. Prepare Features and Target ---
X = df.drop(columns=['Life Expectancy'], axis=1)
y = df['Life Expectancy']

# --- 4. Encode Categorical Features ---
print("Encoding categorical features...")
# 'Family History' and 'Existing Conditions' are now one-hot encoded, so they are removed from this list.
# 'Anxiety Level' has been removed from the dataset entirely.
categorical_cols = [
    'Gender', 'Ethnicity', 'Diet Type', 'Protein Intake', 'Junk Food Frequency',
    'Sugar Intake', 'Diet Quality', 'Smoking', 'Alcohol', 'Sleep Quality',
    'Exercise Type', 'Exposure', 'Urban/Rural', 'State', 'City'
]
encoder_dict = {}
for col in categorical_cols:
    if col in X.columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoder_dict[col] = le
print("Encoding complete.")

# --- 5. Split and Train Model ---
print("Splitting data and retraining the final model...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = lgb.LGBMRegressor(objective='regression', metric='rmse', random_state=42)
model.fit(X_train, y_train)
print("Model retraining complete.")

# --- 6. Save the Final Model and Encoders ---
output_dir = os.path.join(script_dir, '..', 'models')
os.makedirs(output_dir, exist_ok=True)
joblib.dump(model, os.path.join(output_dir, 'life_expectancy_model_v15.pkl'))
joblib.dump(encoder_dict, os.path.join(output_dir, 'label_encoders_v15.pkl'))

print(f"\n✅ Success! Final model (v15) and encoders have been saved to the '{output_dir}' folder.")