import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

const Loader = ({ isLoading }) => {
  return (
    <div
      style={{
        width: '300px',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Player
        autoplay
        loop
        src={isLoading ? '/loading1.json' : '/animation1.json'}
        style={{
          width: '100%',
          height: '100%',
          background: 'none',
        }}
      />
    </div>
  );
};

export default Loader;
