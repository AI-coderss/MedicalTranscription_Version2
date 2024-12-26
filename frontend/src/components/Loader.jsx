import React, { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import "../styles/Loader.css";

const Loader = ({ isLoading }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set breakpoint for mobile
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  const containerStyle = isMobile
    ? {
        width: '180px',
        height: '180px',
        display: 'flex',
        justifyContent: 'flex-end', // Align loader to the right
        alignItems: 'center',
        position: 'fixed',
        top: '35%', // Center vertically
        right: '0px', 
        transform: 'translateY(-50%)', // Adjust for centering
      }
    : {
        width: '200px',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };

  const playerStyle = isMobile
    ? {
        width: '45%',
        height: '45%',
        background: 'none',
      }
    : {
        width: '100%',
        height: '100%',
        background: 'none',
      };

  return (
    <div style={containerStyle}>
      <Player
        className="loading"
        autoplay
        loop
        src={isLoading ? '/loading1.json' : '/animation1.json'}
        style={playerStyle}
      />
    </div>
  );
};

export default Loader;


