export class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });
  }

  init(data) {
    this.score = data?.score || 0;
    this.lives = data?.lives || 3;
    this.level = data?.level || 1;
    this.isBallLaunched = false;
    this.isLevelTransitioning = false;
    this.balls = [];
    this.paddleWidth = 100;
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600, true, true, true, false);
    this.startLevel();
    this.setupControls();
    this.createSoundManager();

    this.scene.launch("UIScene", {
      score: this.score,
      lives: this.lives,
      level: this.level,
    });

    this.events.on("updateScore", (score) => {
      this.score = score;
    });

    this.events.on("updateLives", (lives) => {
      this.lives = lives;
    });
  }

  startLevel() {
    this.isBallLaunched = false;
    this.isLevelTransitioning = false;
    this.paddleWidth = 100;

    if (this.paddle) {
      this.paddle.destroy();
      this.paddle = null;
    }
    if (this.bricks) {
      this.bricks.destroy();
      this.bricks = null;
    }
    const oldBalls = this.balls;
    this.balls = [];
    oldBalls.forEach((b) => {
      if (b && b.active) b.destroy();
    });
    const oldPowerUps = this.powerUps || [];
    this.powerUps = [];
    oldPowerUps.forEach((p) => {
      if (p && p.active) p.destroy();
    });

    this.createPaddle();
    this.createBricks();
    this.createBall();
  }

  shutdown() {
    this.events.removeAllListeners();
    this.scene.stop("UIScene");
  }

  createPaddle() {
    this.paddle = this.physics.add.sprite(400, 560, "paddle");
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);
    this.paddle.setDisplaySize(this.paddleWidth, 16);
    this.paddle.body.checkCollision.none = false;
  }

  createBall() {
    const ball = this.physics.add.sprite(400, 540, "ball");
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
    ball.setCircle(8);
    ball.body.allowGravity = false;
    ball.body.setCircle(8);
    this.physics.add.collider(ball, this.paddle, this.hitPaddle, null, this);
    this.physics.add.collider(ball, this.bricks, this.hitBrick, null, this);
    this.balls.push(ball);
  }

  createBricks() {
    this.bricks = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    const rows = Math.min(4 + this.level, 8);
    const cols = 9;
    const brickWidth = 74;
    const brickHeight = 29;
    const padding = 5;
    const offsetX = (800 - cols * (brickWidth + padding)) / 2;
    const offsetY = 80;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (brickWidth + padding) + brickWidth / 2;
        const y = offsetY + row * (brickHeight + padding) + brickHeight / 2;
        const brick = this.bricks.create(x, y, `brick_${row % 6}`);
        brick.setDisplaySize(brickWidth, brickHeight);
        brick.health = row < 2 ? 2 : 1;
        brick.row = row;
      }
    }
  }

  hitPaddle(ball, paddle) {
    if (!this.isBallLaunched) return;

    const hitPosition = (ball.x - paddle.x) / (paddle.displayWidth / 2);
    const angle = Phaser.Math.DegToRad(hitPosition * 60);
    const speed = Math.max(ball.body.velocity.length(), 300);

    ball.body.velocity.x = speed * Math.sin(angle);
    ball.body.velocity.y = -Math.abs(speed * Math.cos(angle));

    this.soundManager.play("paddle");
  }

  hitBrick(ball, brick) {
    brick.health--;

    if (brick.health <= 0) {
      this.createParticles(brick.x, brick.y);
      this.score += 10 * this.level;
      this.events.emit("updateScore", this.score);

      if (Math.random() < 0.15) {
        this.spawnPowerUp(brick.x, brick.y);
      }

      brick.destroy();
      this.cameras.main.shake(50, 0.003);
    }

    this.soundManager.play("brick");
  }

  createParticles(x, y) {
    const emitter = this.add.particles(x, y, "particle", {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      gravityY: 0,
      emitting: false,
      quantity: 10,
    });

    emitter.explode();

    this.time.delayedCall(500, () => {
      if (emitter.active) {
        emitter.destroy();
      }
    });
  }

  spawnPowerUp(x, y) {
    const types = ["powerup_wide", "powerup_multi"];
    const type = Phaser.Utils.Array.GetRandom(types);

    const powerUp = this.physics.add.sprite(x, y, type);
    powerUp.setVelocityY(100);
    powerUp.setBounce(0);
    powerUp.setCollideWorldBounds(true);
    powerUp.powerUpType = type;

    this.powerUps = this.powerUps || [];
    this.powerUps.push(powerUp);

    this.physics.add.overlap(
      this.paddle,
      powerUp,
      this.collectPowerUp,
      null,
      this,
    );
  }

  collectPowerUp(paddle, powerUp) {
    if (powerUp.powerUpType === "powerup_wide") {
      this.paddleWidth = Math.min(this.paddleWidth + 30, 200);
      this.paddle.setDisplaySize(this.paddleWidth, 16);
    } else if (powerUp.powerUpType === "powerup_multi") {
      this.addExtraBalls();
    }

    this.soundManager.play("powerup");
    powerUp.destroy();
  }

  addExtraBalls() {
    const originalBall = this.balls[0];
    if (!originalBall || !originalBall.active) return;

    for (let i = 0; i < 2; i++) {
      const newBall = this.physics.add.sprite(
        originalBall.x,
        originalBall.y,
        "ball",
      );
      newBall.setCollideWorldBounds(true);
      newBall.setBounce(1, 1);
      newBall.setCircle(8);
      newBall.body.allowGravity = false;
      newBall.body.setCircle(8);

      const angle = Math.random() * 120 - 60 + 180;
      const speed = 300;
      newBall.body.velocity.x = speed * Math.cos(Phaser.Math.DegToRad(angle));
      newBall.body.velocity.y = speed * Math.sin(Phaser.Math.DegToRad(angle));

      this.physics.add.collider(
        newBall,
        this.paddle,
        this.hitPaddle,
        null,
        this,
      );
      this.physics.add.collider(
        newBall,
        this.bricks,
        this.hitBrick,
        null,
        this,
      );

      this.balls.push(newBall);
    }
  }

  setupControls() {
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.input.on("pointerdown", (pointer) => {
      this.isDragging = true;
      this.dragOffsetX = this.paddle.x - pointer.x;
      if (!this.isBallLaunched) {
        this.launchBall();
      }
    });
    this.input.on("pointermove", (pointer) => {
      if (this.isDragging && this.paddle && this.paddle.active) {
        this.paddle.x = Phaser.Math.Clamp(
          pointer.x + this.dragOffsetX,
          this.paddle.displayWidth / 2,
          800 - this.paddle.displayWidth / 2,
        );
      }
    });
    this.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  setupControls() {
    this.input.on("pointermove", (pointer) => {
      if (this.paddle && this.paddle.active) {
        this.paddle.x = Phaser.Math.Clamp(
          pointer.x,
          this.paddle.displayWidth / 2,
          800 - this.paddle.displayWidth / 2,
        );
      }
    });

    this.input.on("pointerdown", () => {
      if (!this.isBallLaunched) {
        this.launchBall();
      }
    });
  }

  launchBall() {
    this.isBallLaunched = true;
    this.events.emit("ballLaunched");
    this.balls.forEach((ball) => {
      if (ball.active) {
        ball.body.velocity.x = Phaser.Math.Between(-100, 100);
        ball.body.velocity.y = -300;
      }
    });
  }

  createSoundManager() {
    this.soundManager = {
      ctx: null,
      play: (type) => {
        if (!this.soundManager.ctx) {
          this.soundManager.ctx = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }
        const audioCtx = this.soundManager.ctx;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        switch (type) {
          case "paddle":
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.type = "sine";
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + 0.1,
            );
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
          case "brick":
            oscillator.frequency.setValueAtTime(
              600 + Math.random() * 200,
              audioCtx.currentTime,
            );
            oscillator.type = "square";
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + 0.1,
            );
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
          case "powerup":
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
              1760,
              audioCtx.currentTime + 0.1,
            );
            oscillator.type = "sine";
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + 0.15,
            );
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
          case "lose":
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(
              100,
              audioCtx.currentTime + 0.3,
            );
            oscillator.type = "sawtooth";
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + 0.3,
            );
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        }
      },
    };
  }

  update() {
    if (this.isLevelTransitioning) return;

    if (!this.isBallLaunched) {
      this.balls.forEach((ball) => {
        if (ball.active && this.paddle && this.paddle.active) {
          ball.x = this.paddle.x;
          ball.y = this.paddle.y - 20;
        }
      });
      return;
    }

    this.balls = this.balls.filter((ball) => {
      if (!ball.active || ball.y > 650) {
        if (ball.active) {
          ball.destroy();
        }
        return false;
      }
      return true;
    });

    if (this.balls.length === 0) {
      this.lives--;
      this.events.emit("updateLives", this.lives);

      if (this.lives <= 0) {
        this.events.emit("gameOver");
        this.scene.pause();
      } else {
        this.soundManager.play("lose");
        this.isBallLaunched = false;
        this.createBall();
        this.paddleWidth = 100;
        this.paddle.setDisplaySize(this.paddleWidth, 16);
      }
    }

    if (
      this.bricks &&
      this.bricks.countActive() === 0 &&
      !this.isLevelTransitioning
    ) {
      this.isLevelTransitioning = true;
      this.level++;
      this.events.emit("levelComplete", this.level);
      this.balls.forEach((ball) => {
        if (ball.active) {
          ball.body.enable = false;
          ball.setAlpha(0);
        }
      });
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    }
  }
}
