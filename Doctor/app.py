import os
import streamlit as st
from streamlit_extras.bottom_container import bottom
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response
from threading import Thread
from flask_cors import CORS
from langchain_core.messages import AIMessage, HumanMessage
from openai import OpenAI
from templates.carousel import carousel_html
from templates.character import character_3d_component
from utils.functions import (
    get_vector_store,
    get_response,
    speech_to_text,
)
from streamlit_chat_widget import chat_input_widget

# Initialize OpenAI Client
load_dotenv()
client = OpenAI()

# Flask setup
flask_app = Flask(__name__)
CORS(
    flask_app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)

@flask_app.route('/process-transcript', methods=['OPTIONS'])
def preflight_request():
    response = Response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

@flask_app.route('/process-transcript', methods=['POST'])
def process_transcript():
    data = request.get_json()
    if not data or "transcript" not in data:
        return jsonify({"message": "Invalid request: No transcript provided."}), 400

    transcript = data["transcript"]

    # Update Streamlit session state
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    st.session_state.transcript = transcript
    st.session_state.chat_history.append(HumanMessage(content=transcript))
    return jsonify({"message": "Transcript processed successfully!"}), 200

# Flask background thread
class FlaskThread(Thread):
    def __init__(self, app):
        super().__init__()
        self.app = app

    def run(self):
        self.app.run(port=8502, debug=False, use_reloader=False)

flask_thread = FlaskThread(flask_app)
flask_thread.start()

def main():
    # Initialize session states
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = [
            AIMessage(
                content="Hello! I'm Medical Assistant. How can I assist you today with your medical inquiries? 🥰"
            )
        ]

    if "vector_store" not in st.session_state:
        st.session_state.vector_store = get_vector_store()

    if "transcript" not in st.session_state:
        st.session_state.transcript = None  # Initialize to None

    # Load and apply custom CSS
    with open("style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    # Display chat history
    for message in st.session_state.chat_history:
        if isinstance(message, AIMessage):
            with st.chat_message("AI", avatar="🤖"):
                st.write(message.content)
        elif isinstance(message, HumanMessage):
            with st.chat_message("Human", avatar="👩‍⚕️"):
                st.write(message.content)

    # Chat input widget
    with bottom():
        response = chat_input_widget()

    user_query = None

    # Handle transcript passed from Flask
    if "transcript" in st.session_state and st.session_state.transcript:
        user_query = st.session_state.transcript
        st.session_state.transcript = None  # Clear transcript after processing

    # Handle user input from chat widget
    if response:
        if "text" in response:
            user_query = response["text"]
        elif "audioFile" in response:
            with st.spinner("Transcribing audio..."):
                audio_file_bytes = response["audioFile"]
                temp_audio_path = "temp_audio.wav"
                with open(temp_audio_path, "wb") as f:
                    f.write(bytes(audio_file_bytes))
                user_query = speech_to_text(temp_audio_path)
                os.remove(temp_audio_path)

    # Process user input and generate response
    if user_query:
        st.session_state.chat_history.append(HumanMessage(content=user_query))
        with st.chat_message("Human", avatar="👩‍⚕️"):
            st.markdown(user_query)

        # Get AI response
        with st.chat_message("AI", avatar="🤖"):
            response = st.write_stream(get_response(user_query))
            st.session_state.chat_history.append(AIMessage(content=response))

if __name__ == "__main__":
    main()
    flask_app.run(port=8502, debug=True, use_reloader=False)
  



