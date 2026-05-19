<div align="center">

# 🕳️ ENDLESS VOID

**A tactical, terminal-aesthetic survival puzzle game built with React & HTML5 Canvas.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

[Features](#-features) • [Gameplay Mechanics](#-gameplay-mechanics) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [How to Play](#-how-to-play)

---

</div>

## 🌌 Overview

**Endless Void** is a high-tension, top-down 2D web-based game. You are plunged into absolute darkness, armed only with a torch that follows your cursor. Your objective is to dive deeper into the void by finding scattered clues to unlock the exit door. 

But the dark is not empty. You must manage your *Sanity*, avoid dangerous illusions, and evade hostile entities that lurk just beyond the reach of your light. Featuring a sleek, tactical "terminal" aesthetic with CRT noise, glitch effects, and atmospheric design, this game tests your resource management and nerve.

---

## ✨ Features

- **Custom 2D Rendering Engine**: Built from scratch using Vanilla JavaScript and HTML5 Canvas API, running highly performant game loops via `requestAnimationFrame`.
- **Dynamic Lighting**: A real-time torch system that illuminates entities, freezes enemies, and creates an oppressive atmosphere.
- **Sanity System**: Actions and enemies drain your sanity. Low sanity causes your torch to flicker and movement to lag, adding tension to the gameplay.
- **Procedural Modifiers**: As you descend deeper, the game introduces random modifiers like *Hidden Timer*, *Anti-Gravity*, *Fake Objects*, and *Hunted*.
- **Tactical UI/UX**: Built with React, the HUD features glowing SVG iconography, blinking terminal text, and CRT screen noise overlays.
- **Audio/Visual Polish**: Glitch effects, pulse animations, and interactive audio feedback (chimes, error buzzes, ambient noise).

---

## 🕹️ Gameplay Mechanics

### Entities of the Void
| Entity | Description |
| :--- | :--- |
| 🔦 **Player** | That's you. Left-click to toggle your torch. Keep an eye on your sanity. |
| 🔮 **Clues** | Glowing orbs. Collect all of them in a level to reveal the Exit Door. |
| 🚪 **Exit Door** | A swirling rift that transports you deeper into the void. |
| ⚠️ **Fake Objects** | Illusions mimicking clues. Touching one drains sanity and gives you a strike. **3 strikes = Game Over.** |
| 👻 **Stalkers** | Hostile entities that drain sanity if they get too close. **Pro-tip:** Shine your torch directly on them to freeze them in place! |
| 💎 **Sanity Crystals** | Rare gems that restore your sanity when collected. |

---

## 💻 Tech Stack

- **Frontend & UI**: `React 19`
- **Game Logic & Physics**: `Vanilla JavaScript (ES6)`
- **Rendering**: `HTML5 Canvas API`
- **Styling**: `Vanilla CSS` (Custom variables, Keyframe animations, Flexbox/Grid)
- **Bundler & Tooling**: `Vite`, `ESLint`

---

## 🚀 Installation

To run the game locally on your machine, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/endless-void.git
   cd endless-void
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Play the game**
   Open your browser and navigate to `http://localhost:5173` (or the port provided by Vite in your terminal).

---

## 🎮 How to Play

1. **Movement**: Your character automatically moves smoothly toward your mouse cursor.
2. **Torch**: `Left-Click` to toggle your torch on and off. 
3. **Objective**: Search the darkness for glowing Clues. Once all are found, locate the Exit Door.
4. **Survival**: Avoid moving blindly into Stalkers. Do not click on Fake Objects. If your sanity runs out or you hit 3 illusions, your journey ends.

---

<div align="center">
  <i>"Don't let the darkness consume you."</i>
</div>
