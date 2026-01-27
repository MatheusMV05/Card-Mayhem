import { Scene, GameObjects } from 'phaser';

/**
 * Cores do tema medieval
 */
const MEDIEVAL_THEME = {
    gold: 0xd4af37,
    darkGold: 0x8b7355,
    parchment: 0xf4e4bc,
    leather: 0x8b4513,
    darkLeather: 0x5c3317,
    blood: 0x8b0000,
    victory: 0x228b22,
    defeat: 0x8b0000
};

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
 * GameOver Scene - Tela de fim de jogo com tema medieval
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
        // Fundo temático
        this.createBackground();

        // Partículas de celebração ou lamento
        this.createParticles();

        // Banner de resultado
        this.createResultBanner();

        // Estatísticas da batalha
        this.createStats();

        // Botões de ação
        this.createButtons();
    }

    private createBackground(): void {
        const graphics = this.add.graphics();
        
        if (this.data.jogadorVenceu) {
            // Fundo dourado/verde para vitória
            graphics.fillGradientStyle(0x2a4a2a, 0x1a3a1a, 0x0f2a0f, 0x0a1a0a, 1);
        } else {
            // Fundo vermelho/escuro para derrota
            graphics.fillGradientStyle(0x4a2a2a, 0x3a1a1a, 0x2a0f0f, 0x1a0505, 1);
        }
        graphics.fillRect(0, 0, 1024, 768);

        // Padrão decorativo medieval
        const pattern = this.add.graphics();
        pattern.lineStyle(1, this.data.jogadorVenceu ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 0.1);
        
        for (let i = 0; i < 20; i++) {
            pattern.lineBetween(0, i * 40, 1024, i * 40);
            pattern.lineBetween(i * 60, 0, i * 60, 768);
        }

        // Vinheta
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 0.5);
        vignette.fillRect(0, 0, 1024, 80);
        vignette.fillRect(0, 688, 1024, 80);
    }

    private createParticles(): void {
        const colors = this.data.jogadorVenceu 
            ? [0xd4af37, 0xffd700, 0x228b22, 0xffffff]
            : [0x8b0000, 0xff4444, 0x333333, 0x666666];

        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(0, 1024);
            const y = Phaser.Math.Between(0, 768);
            const size = Phaser.Math.Between(2, 6);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

            const particle = this.add.circle(x, y, size, color, alpha);

            if (this.data.jogadorVenceu) {
                // Partículas subindo (celebração)
                this.tweens.add({
                    targets: particle,
                    y: y - Phaser.Math.Between(100, 400),
                    x: x + Phaser.Math.Between(-100, 100),
                    alpha: 0,
                    scale: Phaser.Math.FloatBetween(0.5, 1.5),
                    duration: Phaser.Math.Between(3000, 6000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        particle.x = Phaser.Math.Between(0, 1024);
                        particle.y = Phaser.Math.Between(500, 768);
                        particle.alpha = alpha;
                        particle.scale = 1;
                    }
                });
            } else {
                // Partículas caindo (lamento)
                this.tweens.add({
                    targets: particle,
                    y: y + Phaser.Math.Between(50, 200),
                    alpha: 0,
                    duration: Phaser.Math.Between(2000, 5000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        particle.x = Phaser.Math.Between(0, 1024);
                        particle.y = Phaser.Math.Between(0, 100);
                        particle.alpha = alpha;
                    }
                });
            }
        }
    }

    private createResultBanner(): void {
        const isVictory = this.data.jogadorVenceu;

        // Banner grande medieval
        const banner = this.add.graphics();
        banner.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        banner.fillRoundedRect(162, 100, 700, 200, 15);
        banner.lineStyle(6, isVictory ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 1);
        banner.strokeRoundedRect(162, 100, 700, 200, 15);
        banner.lineStyle(3, MEDIEVAL_THEME.darkGold, 0.6);
        banner.strokeRoundedRect(175, 113, 674, 174, 10);

        // Ícone grande
        const icon = isVictory ? '🏆' : '💀';
        this.add.text(512, 150, icon, {
            fontSize: '80px'
        }).setOrigin(0.5);

        // Texto de resultado
        const resultText = isVictory ? 'VITÓRIA GLORIOSA!' : 'DERROTA AMARGA';
        const resultColor = isVictory ? '#d4af37' : '#ff4444';

        const result = this.add.text(512, 240, resultText, {
            fontFamily: 'Georgia, serif',
            fontSize: '42px',
            color: resultColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        // Animação do resultado
        this.tweens.add({
            targets: result,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Mensagem secundária
        this.add.text(512, 330, `${this.data.vencedor} conquistou a batalha!`, {
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            color: '#f4e4bc',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    private createStats(): void {
        const statsContainer = this.add.container(512, 460);

        // Fundo do painel de estatísticas
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.parchment, 0.95);
        bg.fillRoundedRect(-280, -80, 560, 160, 12);
        bg.lineStyle(4, MEDIEVAL_THEME.leather, 1);
        bg.strokeRoundedRect(-280, -80, 560, 160, 12);

        // Título
        const statsTitle = this.add.text(0, -60, '📜 Crônica da Batalha 📜', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#5c3317',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Separador
        const separator = this.add.graphics();
        separator.lineStyle(2, MEDIEVAL_THEME.leather, 0.5);
        separator.lineBetween(-250, -35, 250, -35);
        separator.lineBetween(0, -30, 0, 60);

        // Estatísticas do jogador (esquerda)
        const jogadorIcon = this.data.jogadorVenceu ? '👑' : '💔';
        const jogadorColor = this.data.jogadorVenceu ? '#228b22' : '#8b0000';
        
        const jogadorStats = this.add.text(-140, 10, 
            `${jogadorIcon} ${this.data.jogador.nome}\n` +
            `Classe: ${this.data.jogador.classe}\n` +
            `HP Final: ${this.data.jogador.vida}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: jogadorColor,
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        // VS
        this.add.text(0, 10, '⚔️', {
            fontSize: '30px'
        }).setOrigin(0.5);

        // Estatísticas do oponente (direita)
        const oponenteIcon = !this.data.jogadorVenceu ? '👑' : '💀';
        const oponenteColor = !this.data.jogadorVenceu ? '#228b22' : '#8b0000';
        
        const oponenteStats = this.add.text(140, 10,
            `${oponenteIcon} ${this.data.oponente.nome}\n` +
            `Classe: ${this.data.oponente.classe}\n` +
            `HP Final: ${this.data.oponente.vida}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: oponenteColor,
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        statsContainer.add([bg, statsTitle, separator, jogadorStats, oponenteStats]);
    }

    private createButtons(): void {
        // Botão Jogar Novamente
        this.createMedievalButton(400, 620, '⚔️ Batalhar Novamente', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('CharacterSelect');
            });
        });

        // Botão Menu Principal
        this.createMedievalButton(624, 620, '🏰 Menu Principal', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        });
    }

    private createMedievalButton(
        x: number, 
        y: number, 
        text: string, 
        callback: () => void
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const width = 200;
        const height = 55;

        // Fundo do botão
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.darkLeather, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
        bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 10);

        // Texto do botão
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.gold, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
            buttonText.setColor('#5c3317');
            
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.darkLeather, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
            bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
            buttonText.setColor('#d4af37');
            
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
}
