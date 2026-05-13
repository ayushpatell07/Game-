import React, { useState, useEffect } from 'react';
import { setGameStateCallback } from './game/main';
import StartScreen from './components/StartScreen';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import GameOver from './components/GameOver';

function App() {
  const [gameState, setGameState] = useState('START_SCREEN');
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    setGameStateCallback((state, score) => {
      setGameState(state);
      if (score !== undefined) {
        setFinalScore(score);
      }
    });
  }, []);

  return (
    <div id="game-container">
      <GameCanvas />
      <div id="noise-overlay"></div>
      
      {gameState === 'START_SCREEN' && <StartScreen />}
      {gameState === 'PLAYING' && <HUD />}
      {gameState === 'GAME_OVER' && (
        <GameOver 
          currentScore={finalScore} 
          onRestart={() => window.resetToMainMenu && window.resetToMainMenu()} 
        />
      )}

      <div id="toast"></div>
    </div>
  );
}

export default App;
