import React, { useState} from 'react';
import { AiFillSound, AiOutlinePlayCircle } from 'react-icons/ai';
import axios from 'axios';
import { Player } from '@lottiefiles/react-lottie-player';
import { Howl } from 'howler';

// ✅ Global reference to keep track of the currently playing audio and its state
let currentAudioRef = null;
let setCurrentAudioState = null;

const AudioPlayer = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false); 

    const toggleAudio = async () => {
        // ✅ Prevent multiple audios from playing at once
        if (currentAudioRef) {
            currentAudioRef.stop();
            if (setCurrentAudioState) setCurrentAudioState(false);
        }

        if (isPlaying) {
            currentAudioRef.stop();
            setIsPlaying(false);
            return;
        }

        const storedAudio = sessionStorage.getItem(`audio_${text}`);
        if (storedAudio) {
            try {
                const sound = new Howl({ src: [storedAudio], format: ['mp3'] });
                sound.play();
                currentAudioRef = sound;
                setCurrentAudioState = setIsPlaying;
                setIsPlaying(true);
                sound.on('end', () => setIsPlaying(false));
                return;
            } catch (error) {
                console.warn('Stored audio source invalid, regenerating audio.');
            }
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
            const sound = new Howl({ src: [url], format: ['mp3'] });
            sound.play();
            setIsLoading(false);

            currentAudioRef = sound;
            setCurrentAudioState = setIsPlaying;
            setIsPlaying(true);

            sound.on('end', () => setIsPlaying(false));
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
                        src={`${process.env.PUBLIC_URL}/loading.json`}
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
















