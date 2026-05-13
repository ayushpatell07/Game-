import React, { useEffect, useRef } from 'react';
import { initGame } from '../game/main';

function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // We delay slightly to ensure the canvas is mounted and DOM is ready for the vanilla renderer
    setTimeout(() => {
      initGame();
    }, 50);
  }, []);

  return <canvas id="gameCanvas" ref={canvasRef}></canvas>;
}

export default GameCanvas;
