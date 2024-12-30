from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

@app.route('/send-transcript', methods=['POST'])
def send_transcript():
    # Parse JSON from the request
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request: No data provided."}), 400

    transcript = data.get("transcript")
    if not transcript:
        return jsonify({"message": "Invalid request: No transcript provided."}), 400

    try:
        # Forward transcript to the Streamlit app
        streamlit_url = "http://localhost:8501/process-transcript"
        headers = {"Content-Type": "application/json"}
        response = requests.post(streamlit_url, json={"transcript": transcript}, headers=headers)

        if response.status_code == 200:
            return jsonify({"message": "Transcript sent successfully!"})
        else:
            return jsonify({
                "message": "Failed to send transcript to Streamlit app.",
                "details": response.text
            }), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"message": "Error while forwarding transcript to Streamlit app.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)



