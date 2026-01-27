import { Scene, GameObjects } from 'phaser';

/**
 * MainMenu Scene - Menu principal do jogo
 */
export class MainMenu extends Scene {
    private titleText!: GameObjects.Text;
    private playButton!: GameObjects.Container;
    private pvpButton!: GameObjects.Container;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Fundo gradiente
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, 1024, 768);

        // Partículas decorativas
        this.createParticles();

        // Título do jogo
        this.titleText = this.add.text(512, 150, 'CARD MAYHEM', {
            fontFamily: 'Arial Black',
            fontSize: '72px',
            color: '#e94560',
            stroke: '#0f3460',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(512, 220, 'RPG Arena Battle', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            alpha: 0.8
        }).setOrigin(0.5);

        // Animação do título
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Botão Play (vs CPU)
        this.playButton = this.createButton(512, 400, 'JOGAR vs CPU', () => {
            this.scene.start('CharacterSelect');
        });

        // Botão PvP (W.I.P)
        this.pvpButton = this.createButton(512, 500, 'PvP (Em Breve)', () => {
            this.showWIPMessage();
        }, true);

        // Créditos
        this.add.text(512, 720, 'Desenvolvido com Phaser 3 + TypeScript', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
    }

    private createButton(
        x: number, 
        y: number, 
        text: string, 
        callback: () => void,
        disabled: boolean = false
    ): GameObjects.Container {
        const container = this.add.container(x, y);

        // Fundo do botão
        const bg = this.add.graphics();
        bg.fillStyle(disabled ? 0x444444 : 0xe94560, 1);
        bg.fillRoundedRect(-150, -30, 300, 60, 15);
        
        if (!disabled) {
            bg.lineStyle(3, 0xffffff, 0.3);
            bg.strokeRoundedRect(-150, -30, 300, 60, 15);
        }

        // Texto do botão
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: disabled ? '#888888' : '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, buttonText]);

        if (!disabled) {
            container.setSize(300, 60);
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            });

            container.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });

            container.on('pointerdown', callback);
        }

        return container;
    }

    private createParticles(): void {
        // Criar partículas flutuantes
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(2, 6);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.5);

            const particle = this.add.circle(x, y, size, 0xe94560, alpha);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, 1024);
                    particle.y = Phaser.Math.Between(600, 768);
                    particle.alpha = alpha;
                }
            });
        }
    }

    private showWIPMessage(): void {
        const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
        
        const message = this.add.text(512, 384, '🚧 Em Desenvolvimento 🚧\n\nModo PvP em breve!', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(512, 500, 'Fechar', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#e94560',
            backgroundColor: '#1a1a2e',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            message.destroy();
            closeBtn.destroy();
        });
    }
}
