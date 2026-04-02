export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.score = data?.score || 0;
        this.lives = data?.lives || 3;
        this.level = data?.level || 1;
    }

    create() {
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        const style = {
            font: '20px Arial',
            fill: '#ffffff',
            fontFamily: 'Arial'
        };

        this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, style);
        this.livesText = this.add.text(400, 20, `Lives: ${this.lives}`, style).setOrigin(0.5, 0);
        this.levelText = this.add.text(780, 20, `Level: ${this.level}`, style).setOrigin(1, 0);

        this.startText = this.add.text(400, 300, 'Click to Start', {
            font: '32px Arial',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.gameOverText = null;
        this.levelCompleteText = null;
    }

    setupEventListeners() {
        const playScene = this.scene.get('PlayScene');
        
        playScene.events.on('updateScore', (score) => {
            this.score = score;
            this.scoreText.setText(`Score: ${this.score}`);
        });

        playScene.events.on('updateLives', (lives) => {
            this.lives = lives;
            this.livesText.setText(`Lives: ${this.lives}`);
        });

        playScene.events.on('levelComplete', (level) => {
            this.level = level;
            this.levelText.setText(`Level: ${this.level}`);
            this.showLevelComplete();
        });

        playScene.events.on('gameOver', () => {
            this.showGameOver();
        });

        playScene.events.on('ballLaunched', () => {
            if (this.startText) {
                this.startText.destroy();
                this.startText = null;
            }
        });
    }

    showLevelComplete() {
        if (this.levelCompleteText) {
            this.levelCompleteText.destroy();
        }
        
        this.levelCompleteText = this.add.text(400, 250, `Level ${this.level - 1} Complete!`, {
            font: '28px Arial',
            fill: '#00ff88',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            if (this.levelCompleteText) {
                this.levelCompleteText.destroy();
                this.levelCompleteText = null;
            }
        });
    }

    showGameOver() {
        if (this.gameOverText) {
            this.gameOverText.destroy();
        }
        
        this.gameOverText = this.add.text(400, 250, 'Game Over\nClick to Restart', {
            font: '32px Arial',
            fill: '#ff4444',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        this.gameOverText.on('pointerdown', () => {
            this.scene.stop('PlayScene');
            this.scene.start('PlayScene');
        });
    }
}
