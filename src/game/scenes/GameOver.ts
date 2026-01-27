import { Scene, GameObjects } from 'phaser';

/**
 * Dados recebidos da cena de batalha
 */
interface GameOverData {
    vencedor: string;
    jogadorVenceu: boolean;
    jogador: { nome: string; classe: string; vida: number };
    oponente: { nome: string; classe: string; vida: number };
}

/**
 * GameOver Scene - Tela de fim de jogo
 */
export class GameOver extends Scene {
    private data!: GameOverData;

    constructor() {
        super('GameOver');
    }

    init(data: GameOverData): void {
        this.data = data;
    }

    create(): void {
        // Fundo gradiente
        const graphics = this.add.graphics();
        
        if (this.data.jogadorVenceu) {
            graphics.fillGradientStyle(0x1a4a1a, 0x1a4a1a, 0x0f2a0f, 0x0f2a0f, 1);
        } else {
            graphics.fillGradientStyle(0x4a1a1a, 0x4a1a1a, 0x2a0f0f, 0x2a0f0f, 1);
        }
        graphics.fillRect(0, 0, 1024, 768);

        // Partículas
        this.createParticles(this.data.jogadorVenceu);

        // Texto principal
        const resultText = this.data.jogadorVenceu ? 'VITÓRIA!' : 'DERROTA';
        const resultColor = this.data.jogadorVenceu ? '#22c55e' : '#ef4444';

        this.add.text(512, 200, resultText, {
            fontFamily: 'Arial Black',
            fontSize: '80px',
            color: resultColor,
            stroke: '#000000',
            strokeThickness: 8,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        // Informações da batalha
        this.add.text(512, 320, `${this.data.vencedor} venceu a batalha!`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Estatísticas
        this.createStats();

        // Botões
        this.createButtons();
    }

    private createStats(): void {
        const statsContainer = this.add.container(512, 450);

        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(-200, -60, 400, 120, 15);
        bg.lineStyle(2, 0xe94560, 0.5);
        bg.strokeRoundedRect(-200, -60, 400, 120, 15);

        const statsTitle = this.add.text(0, -45, 'Resultado da Batalha', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#e94560'
        }).setOrigin(0.5);

        const jogadorStats = this.add.text(-180, -15, 
            `${this.data.jogador.nome} (${this.data.jogador.classe})\nHP Final: ${this.data.jogador.vida}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: this.data.jogadorVenceu ? '#22c55e' : '#ef4444'
        });

        const oponenteStats = this.add.text(20, -15,
            `${this.data.oponente.nome} (${this.data.oponente.classe})\nHP Final: ${this.data.oponente.vida}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: !this.data.jogadorVenceu ? '#22c55e' : '#ef4444'
        });

        statsContainer.add([bg, statsTitle, jogadorStats, oponenteStats]);
    }

    private createButtons(): void {
        // Jogar Novamente
        const playAgainBtn = this.createButton(400, 600, 'Jogar Novamente', () => {
            this.scene.start('CharacterSelect');
        });

        // Menu Principal
        const menuBtn = this.createButton(624, 600, 'Menu Principal', () => {
            this.scene.start('MainMenu');
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0xe94560, 1);
        bg.fillRoundedRect(-100, -25, 200, 50, 10);

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([bg, btnText]);
        container.setSize(200, 50);
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

        return container;
    }

    private createParticles(isVictory: boolean): void {
        const color = isVictory ? 0x22c55e : 0xef4444;

        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(3, 8);
            const alpha = Phaser.Math.FloatBetween(0.2, 0.6);

            const particle = this.add.circle(x, y, size, color, alpha);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 1500)
            });
        }
    }
}
