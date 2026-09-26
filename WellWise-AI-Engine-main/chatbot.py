from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import google.generativeai as genai


app = Flask(__name__)
CORS(app)


USER_DATA_FILE = "user_data.txt"

GEMINI_API_KEY = "AIzaSyBuNG6GQFZq5D1ZmUNkp5E_nTUrJqBwoXM"
genai.configure(api_key=GEMINI_API_KEY)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

     
        context = None
        if os.path.exists(USER_DATA_FILE):
            with open(USER_DATA_FILE, "r") as f:
                lines = f.readlines()
                if lines:
                    last_entry = json.loads(lines[-1].strip())
                    context = last_entry.get("data", {})


        if context:
            prompt = f"""You are a smart and kind health assistant.
Here is the user's health profile and give the responses in concise bullet points straight to the point:
{json.dumps(context, indent=2)}

Now, respond to the user’s question in a helpful and personalized way.

User: {user_message}
AI:"""
        else:
            prompt = f"User: {user_message}\nAI:"

       
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        return jsonify({"reply": response.text.strip()})
    except Exception as e:
        print("Chatbot Error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"status": "success", "message": "Gemini chatbot API is running."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)