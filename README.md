# Arkanoid Game

A classic Arkanoid-style brick breaker game built with **Phaser 3**.

## Features

- **Progressive difficulty** — More brick rows added each level
- **Power-ups** — Wide paddle and multi-ball
- **Particle effects** — Brick destruction animations
- **Sound effects** — Synthesized audio for paddle hits, brick breaks, power-ups, and life loss
- **Mobile responsive** — Drag-and-drop controls, auto-scaling canvas
- **Procedural textures** — No external image assets needed

## How to Play

1. Open `index.html` in a browser
2. **Click/tap** to launch the ball
3. **Move mouse/drag** to control the paddle
4. Break all bricks to advance to the next level
5. You have 3 lives — don't let the ball fall below the paddle!

### Power-ups

| Power-up | Color | Effect |
|----------|-------|--------|
| Wide Paddle | Cyan | Increases paddle width |
| Multi-Ball | Magenta | Splits ball into 3 |

## Project Structure

```
arkanoid-game/
├── index.html              # Entry point
├── assets/
│   ├── css/style.css       # Styling & orientation warning
│   └── js/main.js          # Phaser game configuration
├── scenes/
│   ├── BootScene.js        # Procedural texture generation
│   ├── PlayScene.js        # Core gameplay logic
│   └── UIScene.js          # HUD (score, lives, level)
├── favicon.ico
└── favicon.png
```

## Tech Stack

- **Phaser 3.60.0** — Game framework (loaded via CDN)
- **Arcade Physics** — Collision detection and ball physics
- **Web Audio API** — Synthesized sound effects
- **ES Modules** — Scene imports

## Running Locally

No build step required. Serve the project with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Controls

| Input | Action |
|-------|--------|
| Mouse move | Move paddle |
| Click / Tap | Launch ball |
| Drag (mobile) | Move paddle (relative) |

## License

MIT
