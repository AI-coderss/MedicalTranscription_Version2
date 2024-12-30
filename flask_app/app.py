from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow requests from React

# Endpoint to receive and forward the transcript
@app.route('/send-transcript', methods=['POST'])
def send_transcript():
    data = request.get_json()
    transcript = data.get("transcript")

    if not transcript:
        return jsonify({"message": "No transcript provided."}), 400

    try:
        # Forward transcript to the Streamlit app
        streamlit_url = "http://localhost:8501/process-transcript"
        response = requests.post(streamlit_url, json={"transcript": transcript})
        
        if response.status_code == 200:
            return jsonify({"message": "Transcript sent successfully!"})
        else:
            return jsonify({"message": "Failed to send transcript to Streamlit app."}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
