import React, { useState } from 'react';
import { AiFillSound } from 'react-icons/ai';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player'; 

const AudioPlayer = ({ text }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 
    const audioRef = React.useRef(new Audio());

    const fetchAudio = async () => {
        setIsLoading(true);  // Show loader while fetching audio
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

            // Play audio immediately and reset color after completion
            audioRef.current.play();
            setIsPlaying(true);
            setIsLoading(false);

            // When audio ends, revert to gray
            audioRef.current.onended = () => {
                setIsPlaying(false); 
            };

        } catch (error) {
            console.error('Error generating audio:', error);
            setIsLoading(false); 
        }
    };

    const toggleAudio = async () => {
        if (!audioUrl) {
            await fetchAudio();
        } else {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
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



