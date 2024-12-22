import React, { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import Loader from "./Loader";
import "../styles/AudioRecorder.css";

const AudioRecorder = ({ setFields }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
  };

  const togglePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleTranscription = async (recordedBlob) => {
    const audioFile = new File([recordedBlob.blob], "temp.wav", {
      type: "audio/wav",
    });
    const formData = new FormData();
    formData.append("audio_data", audioFile);

    try {
      setLoading(true);

      // Step 1: Transcribe the audio
      const { data: transcriptionData } = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const transcript = transcriptionData.transcript;
      console.log("Transcript: ", transcript);

      // Step 2: Extract fields from the transcript
      const { data: fieldsData } = await axios.post(
        "http://localhost:5000/extract_fields",
        { transcript }
      );

      console.log("Fields Response: ", fieldsData);
      setFields(fieldsData);
    } catch (error) {
      console.error("Error during transcription or field extraction:", error);
    } finally {
      setLoading(false);
    }
  };

  const onStop = (recordedBlob) => {
    console.log("Recorded Blob: ", recordedBlob);
    handleTranscription(recordedBlob);
  };

  return (
    <div className="audio-recorder">
      <h3>MEDICAL TRANSCRIPTION</h3>
      <ReactMic
        record={isRecording}
        pause={isPaused}
        onStop={onStop}
        strokeColor="#007bff"
        visualSetting="frequencyBars"
        backgroundColor="#FFFFFF"
      />
      <div className="recorder-buttons">
        <button onClick={startRecording} disabled={isRecording && !isPaused}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        <button onClick={togglePauseResume} disabled={!isRecording}>
          {isPaused ? "Resume Recording" : "Pause Recording"}
        </button>
        <button onClick={resetRecording}>New Recording</button>
      </div>
      {loading && (
        <div className="loader-container">
          <Loader isLoading={loading} />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;









