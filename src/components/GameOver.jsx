import React, { useState, useEffect } from 'react';

function GameOver({ currentScore, onRestart }) {
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    // 1. Fetch existing scores
    const savedScores = JSON.parse(localStorage.getItem('pep_highscores')) || [];
    
    // 2. Add current score if it's > 0
    let updatedScores = [...savedScores];
    if (currentScore > 0) {
      updatedScores.push(currentScore);
    }
    
    // 3. Sort descending and keep top 3
    updatedScores.sort((a, b) => b - a);
    updatedScores = updatedScores.slice(0, 3);
    
    // 4. Save back to local storage
    localStorage.setItem('pep_highscores', JSON.stringify(updatedScores));
    
    setHighScores(updatedScores);
  }, [currentScore]);

  return (
    <div id="start-screen" style={{ zIndex: 100 }}>
      <h1 style={{ marginBottom: '10px', fontSize: '8rem', color: '#ff3333', WebkitTextStroke: '2px rgba(255, 50, 50, 0.9)' }}>
        GAME OVER
      </h1>
      
      <div style={{ fontSize: '2rem', marginBottom: '40px', letterSpacing: '4px', opacity: 0.9 }}>
        YOUR SCORE: <span style={{ color: '#ffea00' }}>{currentScore}</span>
      </div>
      
      <div style={{ 
        background: 'rgba(0,0,0,0.6)', 
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '30px 60px',
        borderRadius: '15px',
        marginBottom: '40px',
        backdropFilter: 'blur(5px)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px', letterSpacing: '5px', color: 'rgba(255,255,255,0.7)' }}>TOP 3 SCORERS</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.8rem', letterSpacing: '3px' }}>
          {highScores.map((score, index) => (
            <li key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', width: '250px' }}>
              <span style={{ color: index === 0 ? '#ffea00' : index === 1 ? '#e0e0e0' : '#cd7f32' }}>
                #{index + 1}
              </span>
              <span>{score}</span>
            </li>
          ))}
          {highScores.length === 0 && <li>NO SCORES YET</li>}
        </ul>
      </div>

      <button id="start-btn" onClick={onRestart}>
        PLAY AGAIN
      </button>
    </div>
  );
}

export default GameOver;
