import { BootScene } from "../../scenes/BootScene.js";
import { PlayScene } from "../../scenes/PlayScene.js";
import { UIScene } from "../../scenes/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#0a0a1a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PlayScene, UIScene],
};

const game = new Phaser.Game(config);
