import React from 'react';
import { showDisclaimer, showLeaderboard } from '../game/main';

function StartScreen() {
  return (
    <div id="start-screen">
      <h1 className="glitch" data-text="ENDLESS VOID">ENDLESS VOID</h1>
      <button id="start-btn" onClick={() => showDisclaimer()}>START EXPERIENCE</button>
      <button id="start-btn" style={{ marginTop: '20px', fontSize: '1rem', padding: '15px 40px', background: 'transparent' }} onClick={() => showLeaderboard()}>LEADERBOARD</button>
    </div>
  );
}

export default StartScreen;
