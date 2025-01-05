import React, { useState, useRef } from 'react';
import { AiFillSound } from 'react-icons/ai';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player';

// Global reference to the currently playing audio
let currentAudioRef = null;

const AudioPlayer = ({ text }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(new Audio());

    const fetchAudio = async () => {
        setIsLoading(true); // Show loader while fetching audio
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
            setAudioUrl(url);
            audioRef.current.src = url;

            // Play audio immediately
            handlePlayAudio();
            setIsLoading(false);
        } catch (error) {
            console.error('Error generating audio:', error);
            setIsLoading(false);
        }
    };

    const handlePlayAudio = () => {
        // Stop any currently playing audio
        if (currentAudioRef && currentAudioRef !== audioRef.current) {
            currentAudioRef.pause();
            currentAudioRef.currentTime = 0;
        }

        // Play the new audio and set as the current one
        currentAudioRef = audioRef.current;
        audioRef.current.play();
        setIsPlaying(true);

        // Reset play state when audio ends
        audioRef.current.onended = () => {
            setIsPlaying(false);
            currentAudioRef = null;
        };
    };

    const toggleAudio = async () => {
        if (!audioUrl) {
            await fetchAudio();
        } else {
            if (isPlaying) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlaying(false);
                currentAudioRef = null;
            } else {
                handlePlayAudio();
            }
        }
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
            {/* Mic Icon with Color Logic */}
            <AiFillSound
                onClick={toggleAudio}
                size={24}
                style={{ color: isPlaying ? '#007bff' : 'gray' }}
            />
            {/* Lottie Loader (while loading audio) */}
            {isLoading && (
                <Player
                    src={`${process.env.PUBLIC_URL}/loading1.json`}
                    loop
                    autoplay
                    style={{ width: 40, height: 40, marginLeft: '10px' }}
                />
            )}
        </div>
    );
};

export default AudioPlayer;




