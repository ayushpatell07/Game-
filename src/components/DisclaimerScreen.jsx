import React, { useEffect, useState } from 'react';
import { startGame } from '../game/main';

function DisclaimerScreen() {
  const [showBtn, setShowBtn] = useState(false);

  // Delay the button appearance to ensure they "read" the disclaimer
  useEffect(() => {
    const timer = setTimeout(() => setShowBtn(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="disclaimer-screen" className="scanlines">
      <div className="disclaimer-content">
        <h1 className="glitch disclaimer-title" data-text="SYSTEM WARNING">
          SYSTEM WARNING
        </h1>
        
        <div className="disclaimer-text">
          <p className="typing-text type-1">
            <span className="highlight-yellow">[CAUTION]</span> This experience contains flashing lights, sudden noises, and intense psychological themes.
          </p>
          <p className="typing-text type-2">
            <span className="highlight-blue">[MISSION]</span> Descend into the infinite abyss. Collect fractured light shards to open the pathway deeper.
          </p>
          <p className="typing-text type-3">
            <span className="highlight-green">[CONTROLS]</span> Mouse to aim. Click to toggle Flashlight ON/OFF.
          </p>
          <p className="typing-text type-4">
            <span className="highlight-red">[THREAT]</span> Stalkers freeze in light but drain sanity in darkness. If sanity reaches zero, you perish.
          </p>
        </div>
        
        <div className={`btn-container ${showBtn ? 'fade-in' : 'hidden'}`}>
          <button id="start-btn" style={{ animation: 'none', opacity: 1, transform: 'none' }} onClick={() => startGame()}>
            ACKNOWLEDGE & PROCEED
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerScreen;
