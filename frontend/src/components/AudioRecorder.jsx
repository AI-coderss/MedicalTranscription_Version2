import React, { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import { Howl } from "howler";
import Loader from "./Loader";
import useTranscriptStore from "../store/useTranscriptStore";
import useClaimsReviewStore from "../store/useClaimsReviewStore"; // ⬅️ NEW
import "../styles/AudioRecorder.css";

const AudioRecorder = ({ setFields, onTranscriptionFinished }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTranscriptReady, setIsTranscriptReady] = useState(false);

  // Sounds
  const clickSound = new Howl({ src: ["/sound.mp3"], volume: 0.2 });
  const stopSound = new Howl({ src: ["/ui.wav"], volume: 0.2 });

  // Zustand stores
  const setTranscript = useTranscriptStore((s) => s.setTranscript);
  const openClaimsReview = useClaimsReviewStore((s) => s.openClaimsReview);

  const playClickSound = () => clickSound.play();
  const playStopSound = () => stopSound.play();

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
    // ReactMic will invoke onStop with the recordedBlob — that triggers the pipeline
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
    // Clear UI fields
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

  // === Core pipeline after STOP ===
  const handleTranscription = async (recordedBlob) => {
    const audioFile = new File([recordedBlob.blob], "temp.wav", { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio_data", audioFile);

    try {
      setLoading(true);
      console.info("[AudioRecorder] Uploading audio for transcription…");

      // 1) Transcribe
      const { data: transcriptionData } = await axios.post(
        "https://test-medic-transcriber-latest.onrender.com/transcribe",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const transcript = (transcriptionData?.transcript || "").trim();
      console.info("[AudioRecorder] Transcript length:", transcript.length);

      // Save transcript to transcript store (optional, for other pages/tools)
      setTranscript(transcript);

      // 2) Extract fields
      const { data: fieldsData } = await axios.post(
        "https://test-medic-transcriber-latest.onrender.com/extract_fields",
        { transcript }
      );
      console.info("[AudioRecorder] Fields extracted:", fieldsData);

      // Populate UI fields immediately
      setFields(fieldsData);

      // 3) FIRE THE TRIGGER — open Claims Review via Zustand
      openClaimsReview({ transcript, fields: fieldsData });

      // (Optional, additional paths — keep for robustness)
      onTranscriptionFinished?.({ transcript, fields: fieldsData });
      window.dispatchEvent(
        new CustomEvent("dsah:transcriptionFinished", { detail: { transcript, fields: fieldsData } })
      );

      setIsTranscriptReady(true);
    } catch (error) {
      console.error("Error during transcription/field extraction:", error);
    } finally {
      setLoading(false);
    }
  };

  const onStop = (recordedBlob) => {
    console.info("[AudioRecorder] onStop received blob:", recordedBlob?.blob?.size, "bytes");
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
        "https://emr.dsah.sa/LIVE/MRM_API/api/History/SaveHistory",
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














