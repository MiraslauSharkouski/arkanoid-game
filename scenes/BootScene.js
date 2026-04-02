export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.generateTextures();
    this.scene.start("PlayScene");
  }

  generateTextures() {
    const ballGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    ballGraphics.fillStyle(0xffffff, 1);
    ballGraphics.fillCircle(8, 8, 8);
    ballGraphics.generateTexture("ball", 16, 16);
    ballGraphics.destroy();

    const paddleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    paddleGraphics.fillStyle(0x00ff88, 1);
    paddleGraphics.fillRoundedRect(0, 0, 100, 16, 8);
    paddleGraphics.generateTexture("paddle", 100, 16);
    paddleGraphics.destroy();

    const brickColors = [
      0xff4444, 0xff8844, 0xffcc44, 0x44ff44, 0x4488ff, 0x8844ff,
    ];
    brickColors.forEach((color, index) => {
      const brickGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      brickGraphics.fillStyle(color, 1);
      brickGraphics.fillRoundedRect(2, 2, 70, 25, 4);
      brickGraphics.lineStyle(2, 0xffffff, 1);
      brickGraphics.strokeRoundedRect(2, 2, 70, 25, 4);
      brickGraphics.generateTexture(`brick_${index}`, 74, 29);
      brickGraphics.destroy();
    });

    const widePU = this.make.graphics({ x: 0, y: 0, add: false });
    widePU.fillStyle(0x00ffff, 1);
    widePU.fillRoundedRect(0, 0, 40, 30, 6);
    widePU.strokeRoundedRect(0, 0, 40, 30, 6);
    widePU.fillStyle(0xffffff, 1);
    widePU.fillRect(8, 12, 24, 6);
    widePU.fillTriangle(4, 15, 10, 8, 10, 22);
    widePU.fillTriangle(36, 15, 30, 8, 30, 22);
    widePU.generateTexture("powerup_wide", 40, 30);
    widePU.destroy();

    const multiPU = this.make.graphics({ x: 0, y: 0, add: false });
    multiPU.fillStyle(0xff00ff, 1);
    multiPU.fillRoundedRect(0, 0, 40, 30, 6);
    multiPU.strokeRoundedRect(0, 0, 40, 30, 6);
    multiPU.fillStyle(0xffffff, 1);
    multiPU.fillCircle(20, 8, 5);
    multiPU.fillCircle(10, 22, 5);
    multiPU.fillCircle(30, 22, 5);
    multiPU.generateTexture("powerup_multi", 40, 30);
    multiPU.destroy();

    const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture("particle", 8, 8);
    particleGraphics.destroy();
  }
}
