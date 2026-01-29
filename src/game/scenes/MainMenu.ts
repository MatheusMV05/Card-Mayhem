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
    blood: 0x8b0000
};

// Constantes de tela
const SCREEN = {
    WIDTH: 1920,
    HEIGHT: 1080,
    CENTER_X: 960,
    CENTER_Y: 540
};

/**
 * MainMenu Scene - Menu principal com tema medieval
 */
export class MainMenu extends Scene {
    private titleText!: GameObjects.Text;
    private menuMusic!: Phaser.Sound.BaseSound;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Parar qualquer música anterior e tocar música do menu
        this.sound.stopAll();
        this.menuMusic = this.sound.add('menu-theme', { loop: true, volume: 0.5 });
        this.menuMusic.play();

        // Fundo
        this.createBackground();

        // Partículas decorativas (brasas/faíscas)
        this.createParticles();

        // Logo/Título do jogo
        this.createTitle();

        // Botões do menu
        this.createMenuButtons();

        // Rodapé
        this.createFooter();
    }

    private createBackground(): void {
        // Tentar usar bg.png
        try {
            const bg = this.add.image(SCREEN.CENTER_X, SCREEN.CENTER_Y, 'bg');
            bg.setDisplaySize(SCREEN.WIDTH, SCREEN.HEIGHT);
        } catch {
            const graphics = this.add.graphics();
            graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
            graphics.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
        }

        // Overlay para escurecer
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        // Vinheta nas bordas
        const vignette = this.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
        vignette.fillRect(0, 0, SCREEN.WIDTH, 100);
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
        vignette.fillRect(0, SCREEN.HEIGHT - 100, SCREEN.WIDTH, 100);
    }

    private createTitle(): void {
        // Banner decorativo atrás do título - CENTRALIZADO
        const bannerWidth = 700;
        const bannerHeight = 180;
        const bannerX = SCREEN.CENTER_X - bannerWidth / 2;
        const bannerY = 80;

        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(MEDIEVAL_THEME.leather, 0.9);
        bannerBg.fillRoundedRect(bannerX, bannerY, bannerWidth, bannerHeight, 15);
        bannerBg.lineStyle(6, MEDIEVAL_THEME.gold, 1);
        bannerBg.strokeRoundedRect(bannerX, bannerY, bannerWidth, bannerHeight, 15);
        bannerBg.lineStyle(3, MEDIEVAL_THEME.darkGold, 0.7);
        bannerBg.strokeRoundedRect(bannerX + 13, bannerY + 13, bannerWidth - 26, bannerHeight - 26, 10);

        // Decorações laterais
        const leftDecor = this.add.text(bannerX + 50, bannerY + bannerHeight/2, '⚔️', { fontSize: '50px' }).setOrigin(0.5);
        const rightDecor = this.add.text(bannerX + bannerWidth - 50, bannerY + bannerHeight/2, '⚔️', { fontSize: '50px' }).setOrigin(0.5);

        // Animação das decorações
        this.tweens.add({
            targets: [leftDecor, rightDecor],
            angle: { from: -10, to: 10 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Título principal
        this.titleText = this.add.text(SCREEN.CENTER_X, bannerY + 60, 'CARD MAYHEM', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '72px',
            color: '#d4af37',
            fontStyle: 'bold',
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

        // Subtítulo
        this.add.text(SCREEN.CENTER_X, bannerY + 130, '⚔️ RPG Arena Battle ⚔️', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '24px',
            color: '#f4e4bc',
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Animação do título
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Brilho dourado no título
        this.tweens.add({
            targets: this.titleText,
            alpha: { from: 0.9, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }

    private createMenuButtons(): void {
        const buttonStartY = 380;
        const buttonSpacing = 100;

        // Botão JOGAR
        this.createMedievalButton(SCREEN.CENTER_X, buttonStartY, '⚔️ BATALHAR vs CPU', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('CharacterSelect');
            });
        }, false);

        // Botão PvP (desabilitado)
        this.createMedievalButton(SCREEN.CENTER_X, buttonStartY + buttonSpacing, '🏰 PvP Arena (Em Breve)', () => {
            this.showWIPMessage();
        }, true);

        // Botão Instruções
        this.createMedievalButton(SCREEN.CENTER_X, buttonStartY + buttonSpacing * 2, '📜 Como Jogar', () => {
            this.showInstructions();
        }, false, true);
    }

    private createMedievalButton(
        x: number, 
        y: number, 
        text: string, 
        callback: () => void,
        disabled: boolean = false,
        small: boolean = false
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const width = small ? 250 : 350;
        const height = small ? 50 : 70;

        // Fundo do botão
        const bg = this.add.graphics();
        if (disabled) {
            bg.fillStyle(0x444444, 0.8);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
            bg.lineStyle(3, 0x666666, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
        } else {
            bg.fillStyle(MEDIEVAL_THEME.darkLeather, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
            bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
            bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.5);
            bg.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 8);
        }

        // Texto do botão
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: small ? '18px' : '24px',
            color: disabled ? '#888888' : '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: disabled ? 1 : 2
        }).setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setSize(width, height);

        if (!disabled) {
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(MEDIEVAL_THEME.gold, 1);
                bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
                bg.lineStyle(4, 0xffffff, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
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
                bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
                bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
                bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.5);
                bg.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 8);
                buttonText.setColor('#d4af37');
                
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
        // Criar partículas de fogo/brasas flutuantes
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, SCREEN.WIDTH);
            const y = Phaser.Math.Between(400, SCREEN.HEIGHT);
            const size = Phaser.Math.Between(2, 5);
            const colors = [0xd4af37, 0xff6b35, 0xffd700, 0xff4500];
            const color = Phaser.Utils.Array.GetRandom(colors);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.7);

            const particle = this.add.circle(x, y, size, color, alpha);

            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                x: x + Phaser.Math.Between(-50, 50),
                alpha: 0,
                scale: 0.3,
                duration: Phaser.Math.Between(4000, 8000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, SCREEN.WIDTH);
                    particle.y = Phaser.Math.Between(500, SCREEN.HEIGHT);
                    particle.alpha = alpha;
                    particle.scale = 1;
                }
            });
        }
    }

    private createFooter(): void {
        // Linha decorativa
        const line = this.add.graphics();
        line.lineStyle(2, MEDIEVAL_THEME.gold, 0.5);
        line.lineBetween(SCREEN.CENTER_X - 300, 750, SCREEN.CENTER_X + 300, 750);

        // Créditos
        this.add.text(SCREEN.CENTER_X, 800, 'Forjado com Phaser 3 + TypeScript', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '16px',
            color: '#8b7355',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Versão
        this.add.text(SCREEN.WIDTH - 40, SCREEN.HEIGHT - 30, 'v1.0', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(1, 1);
    }

    private showWIPMessage(): void {
        const overlay = this.add.rectangle(SCREEN.CENTER_X, SCREEN.CENTER_Y, SCREEN.WIDTH, SCREEN.HEIGHT, 0x000000, 0.8);
        
        // Caixa de mensagem medieval - CENTRALIZADA
        const boxWidth = 500;
        const boxHeight = 300;
        const boxX = SCREEN.CENTER_X - boxWidth / 2;
        const boxY = SCREEN.CENTER_Y - boxHeight / 2;

        const msgBox = this.add.graphics();
        msgBox.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        msgBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);
        msgBox.lineStyle(5, MEDIEVAL_THEME.gold, 1);
        msgBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);

        const title = this.add.text(SCREEN.CENTER_X, boxY + 60, '🏰 Em Construção 🏰', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '32px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const message = this.add.text(SCREEN.CENTER_X, boxY + 150, 'O modo PvP está sendo\nforjado pelos mestres ferreiros.\n\nAguarde novidades em breve!', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '18px',
            color: '#f4e4bc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        const closeBtn = this.createCloseButton(SCREEN.CENTER_X, boxY + boxHeight - 60, () => {
            overlay.destroy();
            msgBox.destroy();
            title.destroy();
            message.destroy();
            closeBtn.destroy();
        });
    }

    private showInstructions(): void {
        const overlay = this.add.rectangle(SCREEN.CENTER_X, SCREEN.CENTER_Y, SCREEN.WIDTH, SCREEN.HEIGHT, 0x000000, 0.85);
        
        // Caixa de instruções - CENTRALIZADA
        const boxWidth = 800;
        const boxHeight = 650;
        const boxX = SCREEN.CENTER_X - boxWidth / 2;
        const boxY = SCREEN.CENTER_Y - boxHeight / 2;

        const msgBox = this.add.graphics();
        msgBox.fillStyle(MEDIEVAL_THEME.parchment, 0.98);
        msgBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);
        msgBox.lineStyle(5, MEDIEVAL_THEME.leather, 1);
        msgBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 15);

        const title = this.add.text(SCREEN.CENTER_X, boxY + 50, '📜 Pergaminho do Guerreiro 📜', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '32px',
            color: '#5c3317',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const instructions = this.add.text(SCREEN.CENTER_X, boxY + boxHeight / 2, 
            `⚔️ COMBATE
Escolha um campeão e enfrente a CPU em batalha.
Cada classe possui 2 ataques únicos e habilidades especiais.

🃏 CARTAS DE SUPORTE
Você começa com 4 cartas aleatórias no inventário.
Use-as estrategicamente para virar a batalha!

💎 RARIDADES
• Comum (Cinza) - Efeitos básicos
• Incomum (Verde) - Efeitos melhorados
• Raro (Azul) - Efeitos poderosos
• Épico (Amarelo) - Efeitos muito fortes
• Lendário (Dourado) - Efeitos extremos
• Mayhem (Vermelho) - CAÓTICO! Alto risco, alta recompensa

⚡ DICA: Cartas Mayhem podem mudar completamente a batalha,
mas cuidado... elas também podem se voltar contra você!`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '16px',
            color: '#3d2914',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        const closeBtn = this.createCloseButton(SCREEN.CENTER_X, boxY + boxHeight - 50, () => {
            overlay.destroy();
            msgBox.destroy();
            title.destroy();
            instructions.destroy();
            closeBtn.destroy();
        });
    }

    private createCloseButton(x: number, y: number, callback: () => void): GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.blood, 1);
        bg.fillRoundedRect(-80, -25, 160, 50, 10);
        bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
        bg.strokeRoundedRect(-80, -25, 160, 50, 10);

        const text = this.add.text(0, 0, '✕ Fechar', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, text]);
        container.setSize(160, 50);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.gold, 1);
            bg.fillRoundedRect(-80, -25, 160, 50, 10);
            text.setColor('#5c3317');
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.blood, 1);
            bg.fillRoundedRect(-80, -25, 160, 50, 10);
            bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
            bg.strokeRoundedRect(-80, -25, 160, 50, 10);
            text.setColor('#ffffff');
        });

        container.on('pointerdown', callback);

        return container;
    }
}
