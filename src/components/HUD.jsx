import React, { useState, useEffect } from 'react';

function HUD() {
  const [isMuted, setIsMuted] = useState(false);
  const [activeMods, setActiveMods] = useState(['None']);
  const [depth, setDepth] = useState(1);

  useEffect(() => {
    // Expose setter for LevelManager
    window.onModifierChange = (mods) => setActiveMods(mods);
    window.onDepthChange = (d) => setDepth(d);

    // Initial sync
    if (window.AudioSys) setIsMuted(window.AudioSys.isMuted);

    return () => {
      window.onModifierChange = null;
      window.onDepthChange = null;
    };
  }, []);

  const handleMute = () => {
    if (window.AudioSys) {
      const muted = window.AudioSys.toggleMute();
      setIsMuted(muted);
    }
  };

  const isActive = (mod) => activeMods.includes(mod) ? 'active' : '';

  return (
    <div id="persistent-ui">
      <div id="top-left-ui">
        <div style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.8, textShadow: 'none' }}>
          DEPTH: {depth}
        </div>
        <div id="symbol-list">
          <div className={`symbol-icon ${isActive('None')}`} data-modifier="None">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
            <span className="tooltip-text">Standard Environment</span>
          </div>
          <div className={`symbol-icon ${isActive('HiddenTimer')}`} data-modifier="HiddenTimer">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
            <span className="tooltip-text">Hidden Timer</span>
          </div>
          <div className={`symbol-icon ${isActive('FakeObjects')}`} data-modifier="FakeObjects">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span className="tooltip-text">Illusions Present</span>
          </div>
          <div className={`symbol-icon ${isActive('AntiGravity')}`} data-modifier="AntiGravity">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>
            <span className="tooltip-text">Anti-Gravity</span>
          </div>
          <div className={`symbol-icon ${isActive('Hunted')}`} data-modifier="Hunted">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
              <path d="M12 12L2.1 7.1"></path>
              <path d="M12 12l9.9 4.9"></path>
            </svg>
            <span className="tooltip-text">Hunted</span>
          </div>

          <div className="symbol-icon" id="mute-btn" onClick={handleMute} style={{ cursor: 'pointer', opacity: 0.5 }}>
            {isMuted ? (
              <svg id="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : (
              <svg id="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            )}
            <span className="tooltip-text">{isMuted ? 'Unmute' : 'Mute'}</span>
          </div>
        </div>
      </div>
      <div id="top-right-ui" className="blinking-text">
        LEFT CLICK TO ON THE TORCH
      </div>
      <div id="timer-display" style={{ display: 'none' }}></div>
    </div>
  );
}

export default HUD;
