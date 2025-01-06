import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiFillSound, AiOutlinePlayCircle } from 'react-icons/ai';
import axios from 'axios';

// ✅ Global reference to keep track of the currently playing audio and its state
let currentAudioRef = null;
let setCurrentAudioState = null;

const AudioPlayer = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioReady, setAudioReady] = useState(false); 
    const audioRef = useRef(new Audio());

    // ✅ Memoized audio generation with useCallback
    const fetchAudio = useCallback(async () => {
        try {
            const response = await axios.post('https://api.openai.com/v1/audio/speech', {
                model: 'tts-1',
                voice: 'fable',
                input: text
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer' 
            });

            const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
            const url = URL.createObjectURL(audioBlob);
            audioRef.current.src = url;
            setAudioReady(true);  // ✅ Icon only shows when audio is ready
        } catch (error) {
            console.error('Error generating audio:', error);
        }
    }, [text]);

    useEffect(() => {
        fetchAudio();
    }, [fetchAudio]);

    const toggleAudio = () => {
        // ✅ Stop the currently playing audio and reset its state
        if (currentAudioRef && currentAudioRef !== audioRef.current) {
            currentAudioRef.pause();
            currentAudioRef.currentTime = 0;
            if (setCurrentAudioState) setCurrentAudioState(false); // Reset the icon color and state of the previous audio
        }

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            currentAudioRef = audioRef.current; 
            setCurrentAudioState = setIsPlaying; // ✅ Track the current playing audio state
            setIsPlaying(true);
        }

        audioRef.current.onended = () => {
            setIsPlaying(false);
        };
    };

    return (
        <div 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                transition: 'color 0.3s ease-in-out'
            }}
        >
            {/* ✅ Only render the icon when the audio is ready */}
            {audioReady && (
                isPlaying ? (
                    <AiOutlinePlayCircle
                        onClick={toggleAudio} 
                        size={24} 
                        style={{ color: '#007bff' }} 
                    />
                ) : (
                    <AiFillSound 
                        onClick={toggleAudio} 
                        size={24} 
                        style={{ color: 'gray' }} 
                    />
                )
            )}
        </div>
    );
};

export default AudioPlayer;








