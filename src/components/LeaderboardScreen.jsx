import React, { useState, useEffect } from 'react';
import { returnToStart } from '../game/main';

function LeaderboardScreen() {
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('pep_highscores')) || [];
    setHighScores(savedScores.slice(0, 5));
  }, []);

  return (
    <div id="start-screen" style={{ background: 'rgba(11, 13, 16, 0.95)', backdropFilter: 'blur(10px)' }}>
      <h1 style={{ fontSize: '4rem', color: '#4aff4a', marginBottom: '40px', letterSpacing: '8px' }}>HALL OF FAME</h1>
      
      <div style={{ width: '400px', background: 'rgba(0,20,0,0.5)', border: '1px solid rgba(74,255,74,0.3)', padding: '30px', borderRadius: '10px', marginBottom: '40px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1.8rem', fontFamily: 'Courier New' }}>
          {highScores.map((score, index) => (
            <li key={index} style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: index === 0 ? '#ffea00' : '#4aff4a' }}>RANK {index + 1}</span>
              <span style={{ color: '#fff' }}>{score}</span>
            </li>
          ))}
          {highScores.length === 0 && <li style={{ textAlign: 'center', color: '#aaa' }}>NO RECORDS YET</li>}
        </ul>
      </div>

      <button id="start-btn" onClick={() => returnToStart()}>BACK TO MENU</button>
    </div>
  );
}

export default LeaderboardScreen;
