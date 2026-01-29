import { Scene, GameObjects } from 'phaser';
import { Personagem } from '../entities';
import { Arena } from '../arena';
import { RaridadeCores } from '../enums';
import { IItem } from '../interfaces';
import { ManaInsuficienteError } from '../errors';

/**
 * Dados passados para a cena de batalha
 */
interface BattleData {
    jogador: Personagem;
    oponente: Personagem;
    jogadorClasse: { cor: number };
    oponenteClasse: { cor: number };
}

/**
 * Cores do tema medieval
 */
const MEDIEVAL_THEME = {
    gold: 0xd4af37,
    darkGold: 0x8b7355,
    parchment: 0xf4e4bc,
    darkParchment: 0xc9b896,
    leather: 0x8b4513,
    darkLeather: 0x5c3317,
    blood: 0x8b0000,
    healthGreen: 0x228b22,
    manaBlue: 0x4169e1,
    wood: 0x654321,
    iron: 0x71797e,
    shadow: 0x1a1a1a,
    mayhem: 0xff0000,
    fury: 0xff4500
};

// Constantes de timing para gameplay mais lenta
const TIMING = {
    ACTION_DELAY: 800,        // Delay antes de executar ação
    ANIMATION_DURATION: 600,  // Duração das animações
    MESSAGE_DURATION: 2500,   // Tempo que mensagens ficam na tela
    CPU_THINK_DELAY: 1500,    // Tempo de "pensamento" da CPU
    TURN_TRANSITION: 1200,    // Transição entre turnos
    MAYHEM_EFFECT: 3000       // Duração do efeito Mayhem
};

// Dimensões para 1920x1080
const SCREEN = {
    WIDTH: 1920,
    HEIGHT: 1080,
    CENTER_X: 960,
    CENTER_Y: 540
};

/**
 * Battle Scene - Cena principal de batalha com tema medieval
 * Versão 2.0 - Corrigida para melhor gameplay
 */
export class Battle extends Scene {
    private arena!: Arena;
    private jogador!: Personagem;
    private oponente!: Personagem;
    private jogadorCor!: number;
    private oponenteCor!: number;

    // UI Elements
    private jogadorHealthBar!: GameObjects.Graphics;
    private jogadorManaBar!: GameObjects.Graphics;
    private oponenteHealthBar!: GameObjects.Graphics;
    private oponenteManaBar!: GameObjects.Graphics;
    private jogadorHealthText!: GameObjects.Text;
    private jogadorManaText!: GameObjects.Text;
    private oponenteHealthText!: GameObjects.Text;
    private oponenteManaText!: GameObjects.Text;
    private turnoText!: GameObjects.Text;
    private logContainer!: GameObjects.Container;
    private logTexts: GameObjects.Text[] = [];
    private actionContainer!: GameObjects.Container;
    private cardsContainer!: GameObjects.Container;
    private attackButtons: GameObjects.Container[] = [];
    private isPlayerTurn: boolean = true;
    private isAnimating: boolean = false;
    private actionBlocked: boolean = false;
    private battleMusic!: Phaser.Sound.BaseSound;

    constructor() {
        super('Battle');
    }

    /**
     * Reset completo da cena para nova partida
     */
    init(data: BattleData): void {
        // Reset de estados
        this.isPlayerTurn = true;
        this.isAnimating = false;
        this.actionBlocked = false;
        this.logTexts = [];
        this.attackButtons = [];

        // Dados da partida
        this.jogador = data.jogador;
        this.oponente = data.oponente;
        this.jogadorCor = data.jogadorClasse.cor;
        this.oponenteCor = data.oponenteClasse.cor;
    }

    create(): void {
        // Parar qualquer música anterior
        this.sound.stopAll();

        // Tocar intro da batalha e depois o loop
        const battleIntro = this.sound.add('battle-intro', { volume: 0.5 });
        this.battleMusic = this.sound.add('battle-loop', { loop: true, volume: 0.5 });
        
        battleIntro.play();
        battleIntro.once('complete', () => {
            if (this.arena?.batalhaAtiva) {
                this.battleMusic.play();
            }
        });

        // Reset personagens para nova partida
        this.jogador.resetar();
        this.oponente.resetar();

        // Iniciar arena nova
        this.arena = new Arena();
        this.arena.iniciarBatalha(this.jogador, this.oponente);

        // Fundo
        this.createBackground();

        // Indicador de turno
        this.createTurnIndicator();

        // Painéis de status
        this.createStatusPanels();

        // Personagens visuais
        this.createCharacterVisuals();

        // Área de log
        this.createLogArea();

        // Área de ações
        this.createActionArea();

        // Iniciar primeiro turno com delay
        this.addLog('⚔️ A batalha começou!');
        this.time.delayedCall(TIMING.TURN_TRANSITION, () => this.startTurn());
    }

    private createBackground(): void {
        const bg = this.add.image(SCREEN.CENTER_X, SCREEN.CENTER_Y, 'throne-room');
        bg.setDisplaySize(SCREEN.WIDTH, SCREEN.HEIGHT);
        
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.25);
        overlay.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
    }

    private createTurnIndicator(): void {
        const bannerContainer = this.add.container(SCREEN.CENTER_X, 60);

        const banner = this.add.graphics();
        banner.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        banner.fillRoundedRect(-280, -45, 560, 90, 12);
        banner.lineStyle(5, MEDIEVAL_THEME.gold, 1);
        banner.strokeRoundedRect(-280, -45, 560, 90, 12);
        banner.lineStyle(3, MEDIEVAL_THEME.darkGold, 1);
        banner.strokeRoundedRect(-265, -30, 530, 60, 8);

        this.turnoText = this.add.text(0, 0, '⚔️ TURNO 1 ⚔️', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '42px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        bannerContainer.add([banner, this.turnoText]);
    }

    private createStatusPanels(): void {
        this.createPlayerPanel();
        this.createOpponentPanel();
    }

    private createPlayerPanel(): void {
        const panelX = 30;
        const panelY = 140;
        const panelWidth = 420;
        const panelHeight = 200;

        const panel = this.add.container(panelX, panelY);

        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.leather, 0.92);
        bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 15);
        bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 15);
        bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.8);
        bg.strokeRoundedRect(12, 12, panelWidth - 24, panelHeight - 24, 10);

        const nameText = this.add.text(panelWidth / 2, 40, `⚔️ ${this.jogador.nome}`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '28px',
            color: '#' + this.jogadorCor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const classeText = this.add.text(panelWidth / 2, 72, this.jogador.classe, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#f4e4bc'
        }).setOrigin(0.5);

        panel.add([bg, nameText, classeText]);

        this.jogadorHealthBar = this.add.graphics();
        this.jogadorManaBar = this.add.graphics();
        
        this.jogadorHealthText = this.add.text(panelX + panelWidth - 20, panelY + 115, '', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);

        this.jogadorManaText = this.add.text(panelX + panelWidth - 20, panelY + 160, '', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);
    }

    private createOpponentPanel(): void {
        const panelX = SCREEN.WIDTH - 450;
        const panelY = 140;
        const panelWidth = 420;
        const panelHeight = 200;

        const panel = this.add.container(panelX, panelY);

        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.darkLeather, 0.92);
        bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 15);
        bg.lineStyle(4, MEDIEVAL_THEME.blood, 1);
        bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 15);
        bg.lineStyle(2, MEDIEVAL_THEME.iron, 0.8);
        bg.strokeRoundedRect(12, 12, panelWidth - 24, panelHeight - 24, 10);

        const nameText = this.add.text(panelWidth / 2, 40, `💀 ${this.oponente.nome}`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '28px',
            color: '#' + this.oponenteCor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const classeText = this.add.text(panelWidth / 2, 72, this.oponente.classe, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#ccbbaa'
        }).setOrigin(0.5);

        panel.add([bg, nameText, classeText]);

        this.oponenteHealthBar = this.add.graphics();
        this.oponenteManaBar = this.add.graphics();
        
        this.oponenteHealthText = this.add.text(panelX + panelWidth - 20, panelY + 115, '', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);

        this.oponenteManaText = this.add.text(panelX + panelWidth - 20, panelY + 160, '', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0.5);

        this.updateStatusBars();
    }

    private updateStatusBars(): void {
        const barWidth = 280;
        const barHeight = 32;
        
        // === JOGADOR ===
        const jogadorHpPercent = Math.max(0, this.jogador.vida / this.jogador.vidaMaxima);
        const jogadorManaPercent = this.jogador.manaMaxima > 0 
            ? Math.max(0, this.jogador.mana / this.jogador.manaMaxima) 
            : 0;

        const jX = 60;
        const jHealthY = 245;
        const jManaY = 290;

        this.jogadorHealthBar.clear();
        this.jogadorHealthBar.fillStyle(0x2a2a2a, 1);
        this.jogadorHealthBar.fillRoundedRect(jX, jHealthY, barWidth, barHeight, 6);
        this.jogadorHealthBar.lineStyle(3, MEDIEVAL_THEME.gold, 0.9);
        this.jogadorHealthBar.strokeRoundedRect(jX, jHealthY, barWidth, barHeight, 6);
        if (jogadorHpPercent > 0) {
            this.jogadorHealthBar.fillStyle(MEDIEVAL_THEME.healthGreen, 1);
            this.jogadorHealthBar.fillRoundedRect(jX + 3, jHealthY + 3, (barWidth - 6) * jogadorHpPercent, barHeight - 6, 4);
        }
        this.jogadorHealthText.setText(`❤️ ${this.jogador.vida}/${this.jogador.vidaMaxima}`);

        this.jogadorManaBar.clear();
        this.jogadorManaBar.fillStyle(0x2a2a2a, 1);
        this.jogadorManaBar.fillRoundedRect(jX, jManaY, barWidth, barHeight - 6, 6);
        this.jogadorManaBar.lineStyle(3, MEDIEVAL_THEME.gold, 0.9);
        this.jogadorManaBar.strokeRoundedRect(jX, jManaY, barWidth, barHeight - 6, 6);
        
        if (this.jogador.manaMaxima > 0) {
            if (jogadorManaPercent > 0) {
                this.jogadorManaBar.fillStyle(MEDIEVAL_THEME.manaBlue, 1);
                this.jogadorManaBar.fillRoundedRect(jX + 3, jManaY + 3, (barWidth - 6) * jogadorManaPercent, barHeight - 12, 4);
            }
            this.jogadorManaText.setText(`💧 ${this.jogador.mana}/${this.jogador.manaMaxima}`);
        } else {
            // Guerreiro: Sistema de Fúria
            this.jogadorManaBar.fillStyle(MEDIEVAL_THEME.fury, 1);
            this.jogadorManaBar.fillRoundedRect(jX + 3, jManaY + 3, barWidth - 6, barHeight - 12, 4);
            this.jogadorManaText.setText('🔥 FÚRIA');
        }

        // === OPONENTE ===
        const oponenteHpPercent = Math.max(0, this.oponente.vida / this.oponente.vidaMaxima);
        const oponenteManaPercent = this.oponente.manaMaxima > 0 
            ? Math.max(0, this.oponente.mana / this.oponente.manaMaxima) 
            : 0;

        const oX = SCREEN.WIDTH - 420;
        const oHealthY = 245;
        const oManaY = 290;

        this.oponenteHealthBar.clear();
        this.oponenteHealthBar.fillStyle(0x2a2a2a, 1);
        this.oponenteHealthBar.fillRoundedRect(oX, oHealthY, barWidth, barHeight, 6);
        this.oponenteHealthBar.lineStyle(3, MEDIEVAL_THEME.blood, 0.9);
        this.oponenteHealthBar.strokeRoundedRect(oX, oHealthY, barWidth, barHeight, 6);
        if (oponenteHpPercent > 0) {
            this.oponenteHealthBar.fillStyle(0xdc2626, 1);
            this.oponenteHealthBar.fillRoundedRect(oX + 3, oHealthY + 3, (barWidth - 6) * oponenteHpPercent, barHeight - 6, 4);
        }
        this.oponenteHealthText.setText(`❤️ ${this.oponente.vida}/${this.oponente.vidaMaxima}`);

        this.oponenteManaBar.clear();
        this.oponenteManaBar.fillStyle(0x2a2a2a, 1);
        this.oponenteManaBar.fillRoundedRect(oX, oManaY, barWidth, barHeight - 6, 6);
        this.oponenteManaBar.lineStyle(3, MEDIEVAL_THEME.blood, 0.9);
        this.oponenteManaBar.strokeRoundedRect(oX, oManaY, barWidth, barHeight - 6, 6);
        
        if (this.oponente.manaMaxima > 0) {
            if (oponenteManaPercent > 0) {
                this.oponenteManaBar.fillStyle(MEDIEVAL_THEME.manaBlue, 1);
                this.oponenteManaBar.fillRoundedRect(oX + 3, oManaY + 3, (barWidth - 6) * oponenteManaPercent, barHeight - 12, 4);
            }
            this.oponenteManaText.setText(`💧 ${this.oponente.mana}/${this.oponente.manaMaxima}`);
        } else {
            this.oponenteManaBar.fillStyle(MEDIEVAL_THEME.fury, 1);
            this.oponenteManaBar.fillRoundedRect(oX + 3, oManaY + 3, barWidth - 6, barHeight - 12, 4);
            this.oponenteManaText.setText('🔥 FÚRIA');
        }

        // Atualizar indicador de turno
        const turnOwner = this.isPlayerTurn ? 'SEU TURNO' : 'TURNO INIMIGO';
        this.turnoText.setText(`⚔️ ${turnOwner} - TURNO ${this.arena.turnoAtual} ⚔️`);
    }

    private getCharacterAnimKey(classe: string): string {
        const classeNormalizada = classe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        switch (classeNormalizada) {
            case 'guerreiro': return 'guerreiro-idle';
            case 'mago': return 'mago-idle';
            case 'arqueiro': return 'arqueiro-idle';
            case 'paladino': return 'paladino-idle';
            case 'necromante': return 'necromante-idle';
            case 'feiticeiro': return 'feiticeiro-idle';
            default: return 'guerreiro-idle';
        }
    }

    private getCharacterSpriteKey(classe: string): string {
        const classeNormalizada = classe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        switch (classeNormalizada) {
            case 'guerreiro': return 'sprite-guerreiro';
            case 'mago': return 'sprite-mago';
            case 'arqueiro': return 'sprite-arqueiro';
            case 'paladino': return 'sprite-paladino';
            case 'necromante': return 'sprite-necromante';
            case 'feiticeiro': return 'sprite-feiticeiro';
            default: return 'sprite-guerreiro';
        }
    }

    private createCharacterVisuals(): void {
        // Jogador (esquerda)
        const jogadorContainer = this.add.container(380, 520);

        const jogadorShadow = this.add.ellipse(0, 100, 180, 50, 0x000000, 0.5);
        
        const jogadorPedestal = this.add.graphics();
        jogadorPedestal.fillStyle(MEDIEVAL_THEME.gold, 0.35);
        jogadorPedestal.fillEllipse(0, 90, 150, 40);
        jogadorPedestal.lineStyle(3, MEDIEVAL_THEME.gold, 0.9);
        jogadorPedestal.strokeEllipse(0, 90, 150, 40);

        const jogadorSpriteKey = this.getCharacterSpriteKey(this.jogador.classe);
        const jogadorAnimKey = this.getCharacterAnimKey(this.jogador.classe);
        const jogadorSprite = this.add.sprite(0, 0, jogadorSpriteKey);
        jogadorSprite.setScale(10);
        jogadorSprite.setOrigin(0.5, 0.7);
        jogadorSprite.play(jogadorAnimKey);
        
        const jogadorGlow = this.add.graphics();
        jogadorGlow.lineStyle(4, this.jogadorCor, 0.8);
        jogadorGlow.strokeCircle(0, -10, 80);
        jogadorGlow.lineStyle(2, MEDIEVAL_THEME.gold, 0.6);
        jogadorGlow.strokeCircle(0, -10, 88);

        const jogadorNomeTag = this.add.text(0, 80, this.jogador.nome, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '22px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        jogadorContainer.add([jogadorShadow, jogadorPedestal, jogadorGlow, jogadorSprite, jogadorNomeTag]);

        this.tweens.add({
            targets: jogadorSprite,
            y: -8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Oponente (direita)
        const oponenteContainer = this.add.container(SCREEN.WIDTH - 380, 420);

        const oponenteShadow = this.add.ellipse(0, 100, 180, 50, 0x000000, 0.5);

        const oponentePedestal = this.add.graphics();
        oponentePedestal.fillStyle(MEDIEVAL_THEME.blood, 0.35);
        oponentePedestal.fillEllipse(0, 90, 150, 40);
        oponentePedestal.lineStyle(3, MEDIEVAL_THEME.blood, 0.9);
        oponentePedestal.strokeEllipse(0, 90, 150, 40);

        const oponenteSpriteKey = this.getCharacterSpriteKey(this.oponente.classe);
        const oponenteAnimKey = this.getCharacterAnimKey(this.oponente.classe);
        const oponenteSprite = this.add.sprite(0, 0, oponenteSpriteKey);
        oponenteSprite.setScale(-10, 10);
        oponenteSprite.setOrigin(0.5, 0.7);
        oponenteSprite.play(oponenteAnimKey);

        const oponenteGlow = this.add.graphics();
        oponenteGlow.lineStyle(4, this.oponenteCor, 0.8);
        oponenteGlow.strokeCircle(0, -10, 80);
        oponenteGlow.lineStyle(2, MEDIEVAL_THEME.blood, 0.6);
        oponenteGlow.strokeCircle(0, -10, 88);

        const oponenteNomeTag = this.add.text(0, 80, this.oponente.nome, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '22px',
            color: '#ff6666',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        oponenteContainer.add([oponenteShadow, oponentePedestal, oponenteGlow, oponenteSprite, oponenteNomeTag]);

        this.tweens.add({
            targets: oponenteSprite,
            y: -8,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createLogArea(): void {
        // Log maior e mais legível (centro superior)
        this.logContainer = this.add.container(SCREEN.CENTER_X - 350, 130);

        const logBg = this.add.graphics();
        logBg.fillStyle(MEDIEVAL_THEME.parchment, 0.92);
        logBg.fillRoundedRect(0, 0, 700, 260, 12);
        logBg.lineStyle(4, MEDIEVAL_THEME.leather, 1);
        logBg.strokeRoundedRect(0, 0, 700, 260, 12);
        logBg.lineStyle(2, MEDIEVAL_THEME.darkParchment, 0.9);
        logBg.strokeRoundedRect(12, 12, 676, 236, 8);

        const logTitle = this.add.text(350, 28, '📜 Crônicas da Batalha', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '24px',
            color: '#5c3317',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.logContainer.add([logBg, logTitle]);
    }

    private addLog(message: string): void {
        const maxLogs = 6;
        
        if (this.logTexts.length >= maxLogs) {
            const oldText = this.logTexts.shift();
            oldText?.destroy();
            
            this.logTexts.forEach((text, index) => {
                text.y = 55 + (index * 28);
            });
        }

        const newLog = this.add.text(20, this.logTexts.length * 28 + 55, `• ${message}`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '16px',
            color: '#3d2914',
            wordWrap: { width: 660 }
        });

        this.logTexts.push(newLog);
        this.logContainer.add(newLog);
    }

    private createActionArea(): void {
        this.actionContainer = this.add.container(0, SCREEN.HEIGHT - 340);

        const actionBg = this.add.graphics();
        actionBg.fillStyle(MEDIEVAL_THEME.leather, 0.96);
        actionBg.fillRoundedRect(20, 0, SCREEN.WIDTH - 40, 330, 16);
        actionBg.lineStyle(5, MEDIEVAL_THEME.gold, 1);
        actionBg.strokeRoundedRect(20, 0, SCREEN.WIDTH - 40, 330, 16);
        actionBg.lineStyle(3, MEDIEVAL_THEME.darkGold, 0.7);
        actionBg.strokeRoundedRect(35, 15, SCREEN.WIDTH - 70, 300, 12);
        this.actionContainer.add(actionBg);

        const ataquesTitle = this.add.text(220, 30, '⚔️ ATAQUES', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '26px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.actionContainer.add(ataquesTitle);

        const cartasTitle = this.add.text(SCREEN.CENTER_X + 300, 30, '🃏 CARTAS DE SUPORTE', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '26px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.actionContainer.add(cartasTitle);

        // Separador
        const separator = this.add.graphics();
        separator.lineStyle(4, MEDIEVAL_THEME.gold, 0.9);
        separator.lineBetween(460, 20, 460, 310);
        separator.fillStyle(MEDIEVAL_THEME.gold, 1);
        separator.fillCircle(460, 20, 7);
        separator.fillCircle(460, 310, 7);
        this.actionContainer.add(separator);

        this.createAttackButtons();

        this.cardsContainer = this.add.container(500, 65);
        this.actionContainer.add(this.cardsContainer);
        this.updateCards();
    }

    private createAttackButtons(): void {
        // Limpar botões antigos
        this.attackButtons.forEach(btn => btn.destroy());
        this.attackButtons = [];

        // Verificar se o jogador pode atacar (ex: Capa de Invisibilidade)
        const canAttack = this.jogador.podeAtacar();

        if (!canAttack) {
            // Mostrar mensagem de ataques bloqueados
            const blockedBtn = this.createBlockedAttackButton(
                220, 200,
                '⚔️ ATAQUES BLOQUEADOS',
                'Use cartas para agir neste turno'
            );
            this.actionContainer.add(blockedBtn);
            this.attackButtons.push(blockedBtn);
            return;
        }

        // Ataque 1
        const atk1Btn = this.createActionButton(
            220, 150, 
            this.jogador.nomeAtaque1, 
            this.jogador.descricaoAtaque1,
            0,
            () => this.executeAttack(1)
        );
        this.actionContainer.add(atk1Btn);
        this.attackButtons.push(atk1Btn);

        // Ataque 2
        const custoMana = this.jogador.custoManaAtaque2;
        const custoText = custoMana > 0 ? ` (${custoMana} 💧)` : '';
        const atk2Btn = this.createActionButton(
            220, 250,
            this.jogador.nomeAtaque2 + custoText,
            this.jogador.descricaoAtaque2,
            custoMana,
            () => this.executeAttack(2)
        );
        this.actionContainer.add(atk2Btn);
        this.attackButtons.push(atk2Btn);
    }

    private createBlockedAttackButton(
        x: number,
        y: number,
        title: string,
        description: string
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const width = 380;
        const height = 100;

        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
        bg.lineStyle(4, 0x666666, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);

        const titleText = this.add.text(0, -15, title, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '22px',
            color: '#ff6666',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const descText = this.add.text(0, 20, description, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '14px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, titleText, descText]);
        return container;
    }

    private createActionButton(
        x: number, 
        y: number, 
        title: string, 
        description: string,
        manaCost: number,
        callback: () => void
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const width = 380;
        const height = 85;

        const hasEnoughMana = manaCost === 0 || this.jogador.mana >= manaCost;

        // Zona interativa com limites exatos
        const hitZone = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        if (hasEnoughMana) {
            hitZone.setInteractive({ useHandCursor: true });
        }
        container.add(hitZone);

        const bg = this.add.graphics();
        bg.fillStyle(hasEnoughMana ? MEDIEVAL_THEME.darkLeather : 0x3a3a3a, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
        bg.lineStyle(4, hasEnoughMana ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.iron, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);

        const titleText = this.add.text(0, -18, title, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: hasEnoughMana ? '#d4af37' : '#888888',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 30 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const descText = this.add.text(0, 16, description, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '14px',
            color: hasEnoughMana ? '#f4e4bc' : '#666666',
            align: 'center',
            wordWrap: { width: width - 35 }
        }).setOrigin(0.5);

        container.add([bg, titleText, descText]);
        
        if (hasEnoughMana) {
            hitZone.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(MEDIEVAL_THEME.wood, 1);
                bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
                bg.lineStyle(4, 0xffd700, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
                container.setScale(1.03);
            });

            hitZone.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(MEDIEVAL_THEME.darkLeather, 1);
                bg.fillRoundedRect(-width/2, -height/2, width, height, 12);
                bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
                container.setScale(1);
            });

            hitZone.on('pointerdown', () => {
                if (!this.isAnimating && this.isPlayerTurn && !this.actionBlocked) {
                    callback();
                }
            });
        }

        return container;
    }

    private updateCards(): void {
        this.cardsContainer.removeAll(true);

        const cards = this.jogador.inventario;
        const cardWidth = 180;
        const cardHeight = 210;
        const padding = 15;

        const totalWidth = cards.length * (cardWidth + padding) - padding;
        const startX = (SCREEN.WIDTH - 520 - totalWidth) / 2;

        cards.forEach((card, index) => {
            const x = startX + index * (cardWidth + padding);
            const cardContainer = this.createCardUI(x, 0, cardWidth, cardHeight, card, index);
            this.cardsContainer.add(cardContainer);
        });
    }

    private getCardSpriteKey(raridade: string): string {
        switch (raridade) {
            case 'Comum': return 'card-gray';
            case 'Incomum': return 'card-green';
            case 'Raro': return 'card-blue';
            case 'Épico': return 'card-yellow';
            case 'Lendário': return 'card-yellow';
            case 'Mayhem': return 'card-red';
            case 'Super Mayhem': return 'card-red';
            default: return 'card-gray';
        }
    }

    private createCardUI(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        card: IItem, 
        index: number
    ): GameObjects.Container {
        const container = this.add.container(x + width/2, y + height/2);
        const rarityColor = RaridadeCores[card.raridade] || 0x888888;

        // Zona interativa com limites exatos
        const hitZone = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitZone.setInteractive({ useHandCursor: true });
        container.add(hitZone);

        const spriteKey = this.getCardSpriteKey(card.raridade);
        const cardSprite = this.add.image(0, 0, spriteKey);
        cardSprite.setDisplaySize(width, height);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRoundedRect(-width/2 + 10, -height/2 + 10, width - 20, height - 20, 8);

        const border = this.add.graphics();
        border.lineStyle(4, rarityColor, 1);
        border.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 10);

        const rarityText = this.add.text(0, -height/2 + 22, card.raridade.toUpperCase(), {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '12px',
            color: '#' + rarityColor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const nameText = this.add.text(0, -height/2 + 50, card.nome, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 20 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const descText = this.add.text(0, 20, card.descricao, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '11px',
            color: '#f4e4bc',
            align: 'center',
            wordWrap: { width: width - 20 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        container.add([cardSprite, overlay, border, rarityText, nameText, descText]);

        if (card.isMayhem) {
            const mayhemGlow = this.add.graphics();
            mayhemGlow.lineStyle(5, 0xff0000, 0.7);
            mayhemGlow.strokeRoundedRect(-width/2, -height/2, width, height, 12);

            const mayhemBadge = this.add.text(0, height/2 - 25, '⚡ MAYHEM ⚡', {
                fontFamily: 'EightBitDragon, Georgia, serif',
                fontSize: '12px',
                color: '#ffff00',
                fontStyle: 'bold',
                stroke: '#ff0000',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            container.add([mayhemGlow, mayhemBadge]);

            this.tweens.add({
                targets: mayhemGlow,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }

        container.setSize(width, height);

        hitZone.on('pointerover', () => {
            container.y = y + height/2 - 20;
            container.setScale(1.12);
            cardSprite.setTint(0xffffff);
            border.clear();
            border.lineStyle(5, 0xffd700, 1);
            border.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 10);
        });

        hitZone.on('pointerout', () => {
            container.y = y + height/2;
            container.setScale(1);
            cardSprite.clearTint();
            border.clear();
            border.lineStyle(4, rarityColor, 1);
            border.strokeRoundedRect(-width/2 + 6, -height/2 + 6, width - 12, height - 12, 10);
        });

        hitZone.on('pointerdown', () => {
            if (!this.isAnimating && this.isPlayerTurn && !this.actionBlocked) {
                this.useCard(index, card);
            }
        });

        return container;
    }

    private startTurn(): void {
        if (!this.arena.batalhaAtiva) return;

        const messages = this.arena.iniciarTurno();
        messages.forEach(msg => this.addLog(msg));

        this.isPlayerTurn = this.arena.turnoJogador1;
        this.isAnimating = false;
        this.actionBlocked = false;
        
        this.updateStatusBars();
        this.updateCards();
        this.createAttackButtons();

        if (!this.isPlayerTurn && this.arena.batalhaAtiva) {
            this.actionBlocked = true;
            this.time.delayedCall(TIMING.CPU_THINK_DELAY, () => this.cpuTurn());
        }
    }

    private executeAttack(attackNumber: 1 | 2): void {
        if (this.isAnimating || !this.isPlayerTurn || this.actionBlocked) return;

        this.isAnimating = true;
        this.actionBlocked = true;

        try {
            const result = this.arena.executarAtaque(attackNumber);
            this.addLog(result.mensagem);
            
            this.updateStatusBars();
            
            this.animateAction(true, result.tipo, () => {
                this.updateStatusBars();
                this.checkGameEnd();
                
                if (this.arena.batalhaAtiva) {
                    this.time.delayedCall(TIMING.TURN_TRANSITION, () => {
                        this.isAnimating = false;
                        this.startTurn();
                    });
                }
            });
        } catch (error) {
            if (error instanceof ManaInsuficienteError) {
                this.addLog(error.message);
                this.showMessage('⚠️ Mana Insuficiente!', 0xff4444);
            }
            this.isAnimating = false;
            this.actionBlocked = false;
        }
    }

    private useCard(index: number, card: IItem): void {
        if (this.isAnimating || !this.isPlayerTurn || this.actionBlocked) return;

        this.isAnimating = true;
        this.actionBlocked = true;

        // Efeito especial para cartas Mayhem
        if (card.isMayhem) {
            this.showMayhemEffect(card.nome, () => {
                this.executeCardUse(index);
            });
        } else {
            this.showMessage('🃏 Carta Usada!', MEDIEVAL_THEME.gold);
            this.time.delayedCall(TIMING.ACTION_DELAY, () => {
                this.executeCardUse(index);
            });
        }
    }

    private executeCardUse(index: number): void {
        try {
            const result = this.arena.usarCarta(index);
            this.addLog(result.mensagem);
            
            this.updateStatusBars();
            this.updateCards();
            
            this.time.delayedCall(TIMING.MESSAGE_DURATION, () => {
                this.checkGameEnd();

                if (this.arena.batalhaAtiva) {
                    this.time.delayedCall(TIMING.TURN_TRANSITION, () => {
                        this.isAnimating = false;
                        this.startTurn();
                    });
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                this.addLog(error.message);
                this.showMessage(error.message, 0xff4444);
            }
            this.isAnimating = false;
            this.actionBlocked = false;
        }
    }

    private showMayhemEffect(cardName: string, callback: () => void): void {
        // Efeito especial para Exodia
        if (cardName === 'Exodia') {
            this.showExodiaEffect(callback);
            return;
        }

        // Overlay vermelho pulsante
        const overlay = this.add.graphics();
        overlay.fillStyle(0xff0000, 0.4);
        overlay.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        // Shake na câmera
        this.cameras.main.shake(500, 0.02);

        // Texto MAYHEM gigante
        const mayhemText = this.add.text(SCREEN.CENTER_X, SCREEN.CENTER_Y - 100, '⚡ MAYHEM! ⚡', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '80px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#ff0000',
            strokeThickness: 10
        }).setOrigin(0.5).setAlpha(0);

        const cardNameText = this.add.text(SCREEN.CENTER_X, SCREEN.CENTER_Y + 20, cardName, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        // Animação de entrada
        this.tweens.add({
            targets: [mayhemText, cardNameText],
            alpha: 1,
            scale: 1.2,
            duration: 500,
            ease: 'Power2'
        });

        // Flash vermelho pulsante
        this.tweens.add({
            targets: overlay,
            alpha: 0.1,
            duration: 200,
            yoyo: true,
            repeat: 4
        });

        // Limpar e executar callback
        this.time.delayedCall(TIMING.MAYHEM_EFFECT, () => {
            this.tweens.add({
                targets: [overlay, mayhemText, cardNameText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    mayhemText.destroy();
                    cardNameText.destroy();
                    callback();
                }
            });
        });
    }

    private showExodiaEffect(callback: () => void): void {
        // Parar música de batalha e tocar tema Exodia
        this.sound.stopAll();
        const exodiaTheme = this.sound.add('exodia-theme', { volume: 0.8 });
        exodiaTheme.play();

        // Overlay dourado brilhante
        const overlay = this.add.graphics();
        overlay.fillStyle(0xffd700, 0.6);
        overlay.fillRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);

        // Flash branco
        this.cameras.main.flash(1000, 255, 255, 255);
        this.cameras.main.shake(1000, 0.03);

        // Texto EXODIA épico
        const exodiaText = this.add.text(SCREEN.CENTER_X, SCREEN.CENTER_Y - 150, '⭐ EXODIA ⭐', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '120px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#ffd700',
            strokeThickness: 15
        }).setOrigin(0.5).setAlpha(0);

        const subText = this.add.text(SCREEN.CENTER_X, SCREEN.CENTER_Y + 50, 'VITÓRIA INSTANTÂNEA!', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '60px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0);

        // Animação de entrada
        this.tweens.add({
            targets: [exodiaText, subText],
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 1000,
            ease: 'Back.easeOut'
        });

        // Efeito de brilho pulsante
        this.tweens.add({
            targets: exodiaText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 5
        });

        // Executar callback após 5 segundos
        this.time.delayedCall(5000, () => {
            this.tweens.add({
                targets: [overlay, exodiaText, subText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    exodiaText.destroy();
                    subText.destroy();
                    callback();
                }
            });
        });
    }

    private cpuTurn(): void {
        if (!this.arena.batalhaAtiva) return;

        this.isAnimating = true;
        this.addLog('💀 CPU está pensando...');

        this.time.delayedCall(TIMING.CPU_THINK_DELAY, () => {
            const canAttack = this.oponente.podeAtacar();
            const hasCards = this.oponente.inventario.length > 0;
            
            // Se não pode atacar, priorizar usar cartas
            const useCard = !canAttack ? hasCards : (Math.random() < 0.25 && hasCards);
            let actionType: 'dano' | 'buff' | 'cura' | 'neutro' = 'dano';
            let cardUsed: IItem | null = null;

            if (useCard) {
                const cardIndex = Math.floor(Math.random() * this.oponente.inventario.length);
                cardUsed = this.oponente.inventario[cardIndex];
                
                try {
                    const result = this.arena.usarCarta(cardIndex);
                    this.addLog(`💀 [CPU] ${result.mensagem}`);
                    actionType = result.tipo;
                } catch {
                    if (canAttack) {
                        try {
                            const result = this.arena.executarAtaque(1);
                            this.addLog(`💀 [CPU] ${result.mensagem}`);
                            actionType = result.tipo;
                        } catch {
                            this.addLog(`💀 [CPU] não conseguiu agir!`);
                            actionType = 'neutro';
                        }
                    } else {
                        // Não pode atacar e carta falhou - turno perdido
                        this.addLog(`💀 [CPU] está impedido de agir!`);
                        actionType = 'neutro';
                    }
                }
            } else if (canAttack) {
                const attackNum = Math.random() < 0.5 ? 1 : 2;
                try {
                    const result = this.arena.executarAtaque(attackNum as 1 | 2);
                    this.addLog(`💀 [CPU] ${result.mensagem}`);
                    actionType = result.tipo;
                } catch {
                    try {
                        const result = this.arena.executarAtaque(attackNum === 1 ? 2 : 1);
                        this.addLog(`💀 [CPU] ${result.mensagem}`);
                        actionType = result.tipo;
                    } catch {
                        this.addLog(`💀 [CPU] não conseguiu atacar!`);
                        actionType = 'neutro';
                    }
                }
            } else {
                // Não pode atacar e não tem cartas
                this.addLog(`💀 [CPU] está impedido de atacar!`);
                actionType = 'neutro';
            }

            this.updateStatusBars();

            // Se usou carta Mayhem, mostrar efeito
            if (cardUsed?.isMayhem) {
                this.showMayhemEffect(cardUsed.nome, () => {
                    this.finishCpuTurn(actionType);
                });
            } else {
                this.animateAction(false, actionType, () => {
                    this.finishCpuTurn(actionType);
                });
            }
        });
    }

    private finishCpuTurn(_actionType: 'dano' | 'buff' | 'cura' | 'neutro'): void {
        this.updateStatusBars();
        this.checkGameEnd();

        if (this.arena.batalhaAtiva) {
            this.time.delayedCall(TIMING.TURN_TRANSITION, () => {
                this.isAnimating = false;
                this.startTurn();
            });
        }
    }

    private animateAction(isPlayer: boolean, actionType: 'dano' | 'buff' | 'cura' | 'neutro', callback: () => void): void {
        switch (actionType) {
            case 'dano':
                this.animateAttack(isPlayer, callback);
                break;
            case 'buff':
                this.animateBuff(isPlayer, callback);
                break;
            case 'cura':
                this.animateHeal(isPlayer, callback);
                break;
            case 'neutro':
            default:
                this.animateNeutral(isPlayer, callback);
                break;
        }
    }

    private animateAttack(isPlayer: boolean, callback: () => void): void {
        const startX = isPlayer ? 380 : SCREEN.WIDTH - 380;
        const endX = isPlayer ? SCREEN.WIDTH - 380 : 380;
        const startY = isPlayer ? 520 : 420;
        const endY = isPlayer ? 420 : 520;

        const projectile = this.add.graphics();
        projectile.fillStyle(isPlayer ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 1);
        projectile.fillCircle(0, 0, 18);
        projectile.lineStyle(4, 0xffffff, 0.9);
        projectile.strokeCircle(0, 0, 18);
        projectile.setPosition(startX, startY);

        this.tweens.add({
            targets: projectile,
            x: endX,
            y: endY,
            duration: TIMING.ANIMATION_DURATION,
            ease: 'Power2',
            onComplete: () => {
                this.cameras.main.shake(200, 0.02);
                
                const impact = this.add.circle(endX, endY, 40, isPlayer ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 0.9);
                this.tweens.add({
                    targets: impact,
                    scale: 2.5,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => impact.destroy()
                });

                projectile.destroy();
                
                this.time.delayedCall(TIMING.ACTION_DELAY, callback);
            }
        });
    }

    private animateBuff(isPlayer: boolean, callback: () => void): void {
        const x = isPlayer ? 380 : SCREEN.WIDTH - 380;
        const y = isPlayer ? 520 : 420;

        const particles: Phaser.GameObjects.Graphics[] = [];
        const colors = [0x4169e1, 0x6495ed, 0x87ceeb];

        for (let i = 0; i < 12; i++) {
            const particle = this.add.graphics();
            const color = colors[i % colors.length];
            particle.fillStyle(color, 0.85);
            particle.fillCircle(0, 0, 8 + Math.random() * 5);
            particle.setPosition(x + (Math.random() - 0.5) * 80, y + 40);
            particles.push(particle);

            this.tweens.add({
                targets: particle,
                y: y - 120 - Math.random() * 60,
                alpha: 0,
                scale: 0.4,
                duration: 800 + Math.random() * 500,
                delay: i * 100,
                ease: 'Power1',
                onComplete: () => particle.destroy()
            });
        }

        const aura = this.add.graphics();
        aura.lineStyle(5, 0x4169e1, 0.9);
        aura.strokeCircle(x, y - 10, 70);
        
        this.tweens.add({
            targets: aura,
            scale: 1.6,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                aura.destroy();
                this.time.delayedCall(TIMING.ACTION_DELAY, callback);
            }
        });

        this.showMessage('✨ Buff Ativado!', 0x4169e1);
    }

    private animateHeal(isPlayer: boolean, callback: () => void): void {
        const x = isPlayer ? 380 : SCREEN.WIDTH - 380;
        const y = isPlayer ? 520 : 420;

        const particles: Phaser.GameObjects.Graphics[] = [];
        const colors = [0x228b22, 0x32cd32, 0x00ff7f];

        for (let i = 0; i < 15; i++) {
            const particle = this.add.graphics();
            const color = colors[i % colors.length];
            particle.fillStyle(color, 0.9);
            particle.fillRect(-5, -1.5, 10, 3);
            particle.fillRect(-1.5, -5, 3, 10);
            
            particle.setPosition(x + (Math.random() - 0.5) * 100, y + 50);
            particles.push(particle);

            this.tweens.add({
                targets: particle,
                y: y - 140 - Math.random() * 70,
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 1000 + Math.random() * 500,
                delay: i * 70,
                ease: 'Sine.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        const healAura = this.add.graphics();
        healAura.fillStyle(0x228b22, 0.35);
        healAura.fillCircle(x, y - 10, 75);
        healAura.lineStyle(4, 0x32cd32, 0.9);
        healAura.strokeCircle(x, y - 10, 75);
        
        this.tweens.add({
            targets: healAura,
            scale: 1.4,
            alpha: 0,
            duration: 900,
            ease: 'Power2',
            onComplete: () => {
                healAura.destroy();
                this.time.delayedCall(TIMING.ACTION_DELAY, callback);
            }
        });

        this.showMessage('💚 Cura Aplicada!', 0x228b22);
    }

    private animateNeutral(isPlayer: boolean, callback: () => void): void {
        const x = isPlayer ? 380 : SCREEN.WIDTH - 380;
        const y = isPlayer ? 520 : 420;

        const energy = this.add.graphics();
        energy.lineStyle(4, 0xd4af37, 0.7);
        energy.strokeCircle(x, y - 10, 55);
        
        this.tweens.add({
            targets: energy,
            scale: 1.3,
            alpha: 0,
            duration: 500,
            ease: 'Power1',
            onComplete: () => {
                energy.destroy();
                this.time.delayedCall(TIMING.ACTION_DELAY, callback);
            }
        });
    }

    private showMessage(text: string, color: number): void {
        const message = this.add.text(SCREEN.CENTER_X, SCREEN.CENTER_Y - 50, text, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '52px',
            color: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: SCREEN.CENTER_Y - 120,
            scale: 1.3,
            duration: TIMING.MESSAGE_DURATION,
            ease: 'Power2',
            onComplete: () => message.destroy()
        });
    }

    private checkGameEnd(): void {
        if (!this.arena.batalhaAtiva) {
            const vencedor = this.arena.vencedor;
            const jogadorVenceu = vencedor === this.jogador;

            const endText = jogadorVenceu ? '🏆 VITÓRIA! 🏆' : '💀 DERROTA 💀';
            const endColor = jogadorVenceu ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood;
            
            this.showMessage(endText, endColor);

            this.time.delayedCall(3500, () => {
                this.scene.start('GameOver', {
                    vencedor: vencedor?.nome || 'Desconhecido',
                    jogadorVenceu,
                    jogador: this.jogador,
                    oponente: this.oponente
                });
            });
        }
    }
}
