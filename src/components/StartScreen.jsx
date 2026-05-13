import React from 'react';
import { startGame } from '../game/main';

function StartScreen() {
  return (
    <div id="start-screen">
      <h1 className="glitch" data-text="THE GRASPING DARK">THE GRASPING DARK</h1>
      <button id="start-btn" onClick={() => startGame()}>START EXPERIENCE</button>
    </div>
  );
}

export default StartScreen;
