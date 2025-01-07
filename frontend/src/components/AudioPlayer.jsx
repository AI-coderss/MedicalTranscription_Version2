import React, { useState, useRef } from 'react';
import { AiFillSound, AiOutlinePlayCircle } from 'react-icons/ai';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player';

// ✅ Global reference to keep track of the currently playing audio and its state
let currentAudioRef = null;
let setCurrentAudioState = null;

const AudioPlayer = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const audioRef = useRef(new Audio());

    const toggleAudio = async () => {
        // ✅ Prevent multiple audios from playing at once
        if (currentAudioRef && currentAudioRef !== audioRef.current) {
            currentAudioRef.pause();
            currentAudioRef.currentTime = 0;
            if (setCurrentAudioState) setCurrentAudioState(false);
        }

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        const storedAudio = sessionStorage.getItem(`audio_${text}`);
        if (storedAudio) {
            audioRef.current.src = storedAudio;
            audioRef.current.play();
            currentAudioRef = audioRef.current;
            setCurrentAudioState = setIsPlaying;
            setIsPlaying(true);
            return;
        }

        setIsLoading(true); // Show loader when generating audio
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
            sessionStorage.setItem(`audio_${text}`, url);
            audioRef.current.src = url;
            setIsLoading(false);

            audioRef.current.play();
            currentAudioRef = audioRef.current;
            setCurrentAudioState = setIsPlaying;
            setIsPlaying(true);

            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
        } catch (error) {
            console.error('Error generating audio:', error);
            setIsLoading(false); 
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            {/* Show the first icon until audio plays */}
            {(!isPlaying && !isLoading) && (
                <AiFillSound 
                    onClick={toggleAudio} 
                    size={24} 
                    style={{ color: 'gray' }}
                />
            )}
            {/* Loader and first icon during loading */}
            {isLoading && (
                <>
                    <AiFillSound 
                        size={24} 
                        style={{ color: 'gray' }}
                    />
                    <Player
                        src={`${process.env.PUBLIC_URL}/loading1.json`}
                        loop
                        autoplay
                        style={{ width: 30, height: 30, marginLeft: '10px' }}
                    />
                </>
            )}
            {/* Show play icon only when audio is playing */}
            {isPlaying && (
                <AiOutlinePlayCircle 
                    onClick={toggleAudio} 
                    size={24} 
                    style={{ color: '#007bff' }}
                />
            )}
        </div>
    );
};

export default AudioPlayer;















