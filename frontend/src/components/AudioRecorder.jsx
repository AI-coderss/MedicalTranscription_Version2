import React, { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import { Howl } from "howler";
import Loader from "./Loader";
import useTranscriptStore from "../store/useTranscriptStore";
import "../styles/AudioRecorder.css";

const AudioRecorder = ({
  setFields,
  fields,
  mrn,
  doctorId,
  caseNo,
  patientName,
  UserId,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTranscriptReady, setIsTranscriptReady] = useState(false);

  const clickSound = new Howl({
    src: ["/sound.mp3"],
    volume: 0.2,
  });
  const stopSound = new Howl({
    src: ["/ui.wav"],
    volume: 0.2,
  });
  const setTranscript = useTranscriptStore((state) => state.setTranscript);

  const playClickSound = () => {
    clickSound.play();
  };
  const playStopSound = () => {
    stopSound.play();
  };
  const startRecording = () => {
    playClickSound();
    setIsRecording(true);
    setIsPaused(false);
    setIsTranscriptReady(false);
  };

  const stopRecording = () => {
    playStopSound();
    setIsRecording(false);
    setIsPaused(false);
  };

  const togglePauseResume = () => {
    playClickSound();
    setIsPaused((prev) => !prev);
  };

  const resetRecording = () => {
    playClickSound();
    setIsRecording(false);
    setIsPaused(false);
    setIsTranscriptReady(false);

    setFields({
      personalHistory: "",
      chiefComplaint: "",
      presentIllness: "",
      medicationHistory: "",
      pastHistory: "",
      familyHistory: "",
      requiredLabTestsAndProcedures: "",
    });
  };

  const handleTranscription = async (recordedBlob) => {
    const audioFile = new File([recordedBlob.blob], "temp.wav", {
      type: "audio/wav",
    });
    const formData = new FormData();
    formData.append("audio_data", audioFile);

    try {
      setLoading(true);

      const { data: transcriptionData } = await axios.post(
        "https://test-medic-transcriber-latest.onrender.com/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const transcript = transcriptionData.transcript;
      console.log("Transcript: ", transcript);

      setTranscript(transcript);

      const { data: fieldsData } = await axios.post(
        "https://test-medic-transcriber-latest.onrender.com/extract_fields",
        { transcript }
      );

      console.log("Fields Response: ", fieldsData);
      setFields(fieldsData);

      setIsTranscriptReady(true);
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

  // New: Transfer handler here
  const handleTransfer = async () => {
    const payload = {
      trasncript: {
        mrn,
        caseNo,
        personalHistory: fields.personalHistory || "",
        presentIllness: fields.presentIllness || "",
        pastHistory: fields.pastHistory || "",
        chiefComplaint: fields.chiefComplaint || "",
        medicationHistory: fields.medicationHistory || "",
        familyHistory: fields.familyHistory || "",
        HospitalCode: "01",
        UserId,
      },
    };

    console.log("Transfer Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        "https://emr-test.dsah.sa/LIVE/MRM_API/api/History/SaveHistory",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Transfer Success:", response.data);
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transfer Failed:", error);
      alert("Transfer failed. Please check the console for details.");
    }
  };

  return (
    <div className="audio-recorder">
      <h3>MEDICAL TRANSCRIPTION 🎙️</h3>
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
        <button onClick={resetRecording} disabled={!isTranscriptReady}>
          New Recording
        </button>
      </div>
      {loading && (
        <div className="loader-container">
          <Loader isLoading={loading} />
        </div>
      )}

      {/* Show Transfer button only when loading is false and transcript is ready */}
      {!loading && isTranscriptReady && (
        <div className="button-wrapper" style={{ marginTop: "20px" }}>
          <button
            className="transfer-button w-full p-[14px_9px] text-[20px] border-l-[10px] border-[#747EF2] rounded-[12px_0_10px_0]"
            onClick={handleTransfer}
          >
            Transfer
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
