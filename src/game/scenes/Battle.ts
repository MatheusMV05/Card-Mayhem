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
    shadow: 0x1a1a1a
};

/**
 * Battle Scene - Cena principal de batalha com tema medieval
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
    private isPlayerTurn: boolean = true;
    private isAnimating: boolean = false;

    constructor() {
        super('Battle');
    }

    init(data: BattleData): void {
        this.jogador = data.jogador;
        this.oponente = data.oponente;
        this.jogadorCor = data.jogadorClasse.cor;
        this.oponenteCor = data.oponenteClasse.cor;
    }

    create(): void {
        // Iniciar arena
        this.arena = new Arena();
        this.arena.iniciarBatalha(this.jogador, this.oponente);

        // Fundo com imagem throne room
        this.createBackground();

        // Indicador de turno (topo)
        this.createTurnIndicator();

        // UI de status dos personagens
        this.createStatusPanels();

        // Personagens visuais
        this.createCharacterVisuals();

        // Área de log (pergaminho)
        this.createLogArea();

        // Área de ações (ataques e cartas) - painel inferior
        this.createActionArea();

        // Iniciar primeiro turno
        this.startTurn();
    }

    private createBackground(): void {
        // Imagem de fundo throne room
        const bg = this.add.image(512, 384, 'throne-room');
        bg.setDisplaySize(1024, 768);
        
        // Overlay escuro para melhor contraste da UI
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, 1024, 768);
    }

    private createTurnIndicator(): void {
        // Banner medieval para indicador de turno
        const bannerContainer = this.add.container(512, 45);

        // Fundo do banner
        const banner = this.add.graphics();
        banner.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        banner.fillRoundedRect(-180, -35, 360, 70, 8);
        banner.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        banner.strokeRoundedRect(-180, -35, 360, 70, 8);
        
        // Decorações douradas
        banner.lineStyle(2, MEDIEVAL_THEME.darkGold, 1);
        banner.strokeRoundedRect(-170, -25, 340, 50, 5);

        this.turnoText = this.add.text(0, 0, '⚔️ TURNO 1 ⚔️', {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        bannerContainer.add([banner, this.turnoText]);
    }

    private createStatusPanels(): void {
        // === PAINEL DO JOGADOR (esquerda) ===
        this.createPlayerPanel();
        
        // === PAINEL DO OPONENTE (direita) ===
        this.createOpponentPanel();
    }

    private createPlayerPanel(): void {
        const panelX = 20;
        const panelY = 100;
        const panelWidth = 280;
        const panelHeight = 140;

        // Container do painel
        const panel = this.add.container(panelX, panelY);

        // Fundo estilo pergaminho/couro
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.leather, 0.9);
        bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
        bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
        bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 10);
        bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.7);
        bg.strokeRoundedRect(8, 8, panelWidth - 16, panelHeight - 16, 6);

        // Nome do jogador
        const nameText = this.add.text(panelWidth / 2, 25, `⚔️ ${this.jogador.nome}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#' + this.jogadorCor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Classe
        const classeText = this.add.text(panelWidth / 2, 48, this.jogador.classe, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f4e4bc'
        }).setOrigin(0.5);

        panel.add([bg, nameText, classeText]);

        // Barras de vida e mana
        this.jogadorHealthBar = this.add.graphics();
        this.jogadorManaBar = this.add.graphics();
        
        this.jogadorHealthText = this.add.text(panelX + panelWidth - 10, panelY + 75, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);

        this.jogadorManaText = this.add.text(panelX + panelWidth - 10, panelY + 105, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);
    }

    private createOpponentPanel(): void {
        const panelX = 724;
        const panelY = 100;
        const panelWidth = 280;
        const panelHeight = 140;

        // Container do painel
        const panel = this.add.container(panelX, panelY);

        // Fundo estilo pergaminho/couro
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.darkLeather, 0.9);
        bg.fillRoundedRect(0, 0, panelWidth, panelHeight, 10);
        bg.lineStyle(3, MEDIEVAL_THEME.blood, 1);
        bg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 10);
        bg.lineStyle(2, MEDIEVAL_THEME.iron, 0.7);
        bg.strokeRoundedRect(8, 8, panelWidth - 16, panelHeight - 16, 6);

        // Nome do oponente
        const nameText = this.add.text(panelWidth / 2, 25, `💀 ${this.oponente.nome}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#' + this.oponenteCor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Classe
        const classeText = this.add.text(panelWidth / 2, 48, this.oponente.classe, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ccbbaa'
        }).setOrigin(0.5);

        panel.add([bg, nameText, classeText]);

        // Barras de vida e mana
        this.oponenteHealthBar = this.add.graphics();
        this.oponenteManaBar = this.add.graphics();
        
        this.oponenteHealthText = this.add.text(panelX + panelWidth - 10, panelY + 75, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);

        this.oponenteManaText = this.add.text(panelX + panelWidth - 10, panelY + 105, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);

        this.updateStatusBars();
    }

    private updateStatusBars(): void {
        const barWidth = 180;
        const barHeight = 22;
        
        // === JOGADOR ===
        const jogadorHpPercent = Math.max(0, this.jogador.vida / this.jogador.vidaMaxima);
        const jogadorManaPercent = this.jogador.manaMaxima > 0 
            ? Math.max(0, this.jogador.mana / this.jogador.manaMaxima) 
            : 0;

        const jX = 35;
        const jHealthY = 165;
        const jManaY = 195;

        this.jogadorHealthBar.clear();
        // Fundo da barra
        this.jogadorHealthBar.fillStyle(0x2a2a2a, 1);
        this.jogadorHealthBar.fillRoundedRect(jX, jHealthY, barWidth, barHeight, 4);
        // Borda decorativa
        this.jogadorHealthBar.lineStyle(2, MEDIEVAL_THEME.gold, 0.8);
        this.jogadorHealthBar.strokeRoundedRect(jX, jHealthY, barWidth, barHeight, 4);
        // Barra de vida
        if (jogadorHpPercent > 0) {
            this.jogadorHealthBar.fillStyle(MEDIEVAL_THEME.healthGreen, 1);
            this.jogadorHealthBar.fillRoundedRect(jX + 2, jHealthY + 2, (barWidth - 4) * jogadorHpPercent, barHeight - 4, 3);
        }
        // Ícone
        this.jogadorHealthText.setText(`❤️ ${this.jogador.vida}/${this.jogador.vidaMaxima}`);

        this.jogadorManaBar.clear();
        this.jogadorManaBar.fillStyle(0x2a2a2a, 1);
        this.jogadorManaBar.fillRoundedRect(jX, jManaY, barWidth, barHeight - 4, 4);
        this.jogadorManaBar.lineStyle(2, MEDIEVAL_THEME.gold, 0.8);
        this.jogadorManaBar.strokeRoundedRect(jX, jManaY, barWidth, barHeight - 4, 4);
        
        if (this.jogador.manaMaxima > 0) {
            if (jogadorManaPercent > 0) {
                this.jogadorManaBar.fillStyle(MEDIEVAL_THEME.manaBlue, 1);
                this.jogadorManaBar.fillRoundedRect(jX + 2, jManaY + 2, (barWidth - 4) * jogadorManaPercent, barHeight - 8, 3);
            }
            this.jogadorManaText.setText(`💧 ${this.jogador.mana}/${this.jogador.manaMaxima}`);
        } else {
            this.jogadorManaText.setText('⚔️ Fúria');
        }

        // === OPONENTE ===
        const oponenteHpPercent = Math.max(0, this.oponente.vida / this.oponente.vidaMaxima);
        const oponenteManaPercent = this.oponente.manaMaxima > 0 
            ? Math.max(0, this.oponente.mana / this.oponente.manaMaxima) 
            : 0;

        const oX = 739;
        const oHealthY = 165;
        const oManaY = 195;

        this.oponenteHealthBar.clear();
        this.oponenteHealthBar.fillStyle(0x2a2a2a, 1);
        this.oponenteHealthBar.fillRoundedRect(oX, oHealthY, barWidth, barHeight, 4);
        this.oponenteHealthBar.lineStyle(2, MEDIEVAL_THEME.blood, 0.8);
        this.oponenteHealthBar.strokeRoundedRect(oX, oHealthY, barWidth, barHeight, 4);
        if (oponenteHpPercent > 0) {
            this.oponenteHealthBar.fillStyle(0xdc2626, 1);
            this.oponenteHealthBar.fillRoundedRect(oX + 2, oHealthY + 2, (barWidth - 4) * oponenteHpPercent, barHeight - 4, 3);
        }
        this.oponenteHealthText.setText(`❤️ ${this.oponente.vida}/${this.oponente.vidaMaxima}`);

        this.oponenteManaBar.clear();
        this.oponenteManaBar.fillStyle(0x2a2a2a, 1);
        this.oponenteManaBar.fillRoundedRect(oX, oManaY, barWidth, barHeight - 4, 4);
        this.oponenteManaBar.lineStyle(2, MEDIEVAL_THEME.blood, 0.8);
        this.oponenteManaBar.strokeRoundedRect(oX, oManaY, barWidth, barHeight - 4, 4);
        
        if (this.oponente.manaMaxima > 0) {
            if (oponenteManaPercent > 0) {
                this.oponenteManaBar.fillStyle(MEDIEVAL_THEME.manaBlue, 1);
                this.oponenteManaBar.fillRoundedRect(oX + 2, oManaY + 2, (barWidth - 4) * oponenteManaPercent, barHeight - 8, 3);
            }
            this.oponenteManaText.setText(`💧 ${this.oponente.mana}/${this.oponente.manaMaxima}`);
        } else {
            this.oponenteManaText.setText('⚔️ Fúria');
        }

        // Atualizar turno
        const turnOwner = this.isPlayerTurn ? 'SEU TURNO' : 'TURNO INIMIGO';
        this.turnoText.setText(`⚔️ ${turnOwner} - TURNO ${this.arena.turnoAtual} ⚔️`);
    }

    private createCharacterVisuals(): void {
        // === JOGADOR (esquerda) ===
        const jogadorContainer = this.add.container(200, 380);

        // Círculo de base (sombra)
        const jogadorShadow = this.add.ellipse(0, 60, 100, 30, 0x000000, 0.5);
        
        // Avatar do jogador
        const jogadorBg = this.add.graphics();
        jogadorBg.fillStyle(this.jogadorCor, 1);
        jogadorBg.fillCircle(0, 0, 55);
        jogadorBg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        jogadorBg.strokeCircle(0, 0, 55);
        jogadorBg.lineStyle(2, 0xffffff, 0.3);
        jogadorBg.strokeCircle(0, 0, 50);

        const jogadorLetra = this.add.text(0, 0, this.jogador.classe.charAt(0), {
            fontFamily: 'Georgia, serif',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        jogadorContainer.add([jogadorShadow, jogadorBg, jogadorLetra]);

        // === OPONENTE (direita) ===
        const oponenteContainer = this.add.container(824, 300);

        // Círculo de base (sombra)
        const oponenteShadow = this.add.ellipse(0, 60, 100, 30, 0x000000, 0.5);

        // Avatar do oponente
        const oponenteBg = this.add.graphics();
        oponenteBg.fillStyle(this.oponenteCor, 1);
        oponenteBg.fillCircle(0, 0, 55);
        oponenteBg.lineStyle(4, MEDIEVAL_THEME.blood, 1);
        oponenteBg.strokeCircle(0, 0, 55);
        oponenteBg.lineStyle(2, 0x000000, 0.5);
        oponenteBg.strokeCircle(0, 0, 50);

        const oponenteLetra = this.add.text(0, 0, this.oponente.classe.charAt(0), {
            fontFamily: 'Georgia, serif',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        oponenteContainer.add([oponenteShadow, oponenteBg, oponenteLetra]);
    }

    private createLogArea(): void {
        // Pergaminho de histórico (centro superior)
        this.logContainer = this.add.container(320, 100);

        // Fundo estilo pergaminho
        const logBg = this.add.graphics();
        logBg.fillStyle(MEDIEVAL_THEME.parchment, 0.9);
        logBg.fillRoundedRect(0, 0, 380, 150, 8);
        logBg.lineStyle(3, MEDIEVAL_THEME.leather, 1);
        logBg.strokeRoundedRect(0, 0, 380, 150, 8);
        logBg.lineStyle(1, MEDIEVAL_THEME.darkParchment, 0.8);
        logBg.strokeRoundedRect(8, 8, 364, 134, 5);

        // Título
        const logTitle = this.add.text(190, 18, '📜 Crônicas da Batalha', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#5c3317',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.logContainer.add([logBg, logTitle]);
    }

    private addLog(message: string): void {
        const maxLogs = 5;
        
        if (this.logTexts.length >= maxLogs) {
            const oldText = this.logTexts.shift();
            oldText?.destroy();
            
            this.logTexts.forEach((text, index) => {
                text.y = 40 + (index * 22);
            });
        }

        const newLog = this.add.text(15, this.logTexts.length * 22 + 40, `• ${message}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#3d2914',
            wordWrap: { width: 350 }
        });

        this.logTexts.push(newLog);
        this.logContainer.add(newLog);
    }

    private createActionArea(): void {
        // Painel inferior principal
        this.actionContainer = this.add.container(0, 520);

        // Fundo estilo madeira/couro
        const actionBg = this.add.graphics();
        actionBg.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        actionBg.fillRoundedRect(15, 0, 994, 240, 12);
        actionBg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        actionBg.strokeRoundedRect(15, 0, 994, 240, 12);
        actionBg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.6);
        actionBg.strokeRoundedRect(25, 10, 974, 220, 8);
        this.actionContainer.add(actionBg);

        // Título "Ações de Combate"
        const ataquesTitle = this.add.text(160, 18, '⚔️ ATAQUES', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.actionContainer.add(ataquesTitle);

        // Título "Cartas"
        const cartasTitle = this.add.text(660, 18, '🃏 CARTAS DE SUPORTE', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.actionContainer.add(cartasTitle);

        // Separador decorativo vertical
        const separator = this.add.graphics();
        separator.lineStyle(3, MEDIEVAL_THEME.gold, 0.8);
        separator.lineBetween(330, 15, 330, 225);
        separator.fillStyle(MEDIEVAL_THEME.gold, 1);
        separator.fillCircle(330, 15, 5);
        separator.fillCircle(330, 225, 5);
        this.actionContainer.add(separator);

        // Criar botões de ataque
        this.createAttackButtons();

        // Container para cartas - posição mais centralizada
        this.cardsContainer = this.add.container(350, 45);
        this.actionContainer.add(this.cardsContainer);
        this.updateCards();
    }

    private createAttackButtons(): void {
        // Ataque 1
        const atk1Btn = this.createActionButton(
            160, 125, 
            this.jogador.nomeAtaque1, 
            this.jogador.descricaoAtaque1,
            0,
            () => this.executeAttack(1)
        );
        this.actionContainer.add(atk1Btn);

        // Ataque 2
        const custoMana = this.jogador.custoManaAtaque2;
        const custoText = custoMana > 0 ? ` (${custoMana} 💧)` : '';
        const atk2Btn = this.createActionButton(
            160, 200,
            this.jogador.nomeAtaque2 + custoText,
            this.jogador.descricaoAtaque2,
            custoMana,
            () => this.executeAttack(2)
        );
        this.actionContainer.add(atk2Btn);
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
        const width = 260;
        const height = 60;

        // Verificar se tem mana suficiente
        const hasEnoughMana = manaCost === 0 || this.jogador.mana >= manaCost;

        // Fundo do botão estilo medieval
        const bg = this.add.graphics();
        bg.fillStyle(hasEnoughMana ? MEDIEVAL_THEME.darkLeather : 0x3a3a3a, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
        bg.lineStyle(3, hasEnoughMana ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.iron, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);

        // Título do ataque
        const titleText = this.add.text(0, -12, title, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: hasEnoughMana ? '#d4af37' : '#888888',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 20 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Descrição
        const descText = this.add.text(0, 12, description, {
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            color: hasEnoughMana ? '#f4e4bc' : '#666666',
            align: 'center',
            wordWrap: { width: width - 25 }
        }).setOrigin(0.5);

        container.add([bg, titleText, descText]);
        container.setSize(width, height);
        
        if (hasEnoughMana) {
            container.setInteractive({ useHandCursor: true });

            container.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(MEDIEVAL_THEME.wood, 1);
                bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
                bg.lineStyle(3, 0xffd700, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
                container.setScale(1.02);
            });

            container.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(MEDIEVAL_THEME.darkLeather, 1);
                bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
                bg.lineStyle(3, MEDIEVAL_THEME.gold, 1);
                bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
                container.setScale(1);
            });

            container.on('pointerdown', () => {
                if (!this.isAnimating && this.isPlayerTurn) {
                    callback();
                }
            });
        }

        return container;
    }

    private updateCards(): void {
        this.cardsContainer.removeAll(true);

        const cards = this.jogador.inventario;
        const cardWidth = 145;
        const cardHeight = 170;
        const padding = 15;

        // Centralizar as cartas
        const totalWidth = cards.length * (cardWidth + padding) - padding;
        const startX = (640 - totalWidth) / 2;

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

        // Sprite da carta como fundo
        const spriteKey = this.getCardSpriteKey(card.raridade);
        const cardSprite = this.add.image(0, 0, spriteKey);
        cardSprite.setDisplaySize(width, height);

        // Overlay para legibilidade
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.35);
        overlay.fillRoundedRect(-width/2 + 8, -height/2 + 8, width - 16, height - 16, 6);

        // Borda decorativa
        const border = this.add.graphics();
        border.lineStyle(3, rarityColor, 1);
        border.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, 8);

        // Raridade (topo)
        const rarityText = this.add.text(0, -height/2 + 20, card.raridade.toUpperCase(), {
            fontFamily: 'Georgia, serif',
            fontSize: '10px',
            color: '#' + rarityColor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Nome da carta
        const nameText = this.add.text(0, -height/2 + 50, card.nome, {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 25 },
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Descrição
        const descText = this.add.text(0, 15, card.descricao, {
            fontFamily: 'Georgia, serif',
            fontSize: '10px',
            color: '#f4e4bc',
            align: 'center',
            wordWrap: { width: width - 25 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        container.add([cardSprite, overlay, border, rarityText, nameText, descText]);

        // Badge Mayhem especial
        if (card.isMayhem) {
            const mayhemGlow = this.add.graphics();
            mayhemGlow.lineStyle(4, 0xff0000, 0.6);
            mayhemGlow.strokeRoundedRect(-width/2, -height/2, width, height, 10);

            const mayhemBadge = this.add.text(0, height/2 - 22, '⚡ MAYHEM ⚡', {
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                color: '#ffff00',
                fontStyle: 'bold',
                stroke: '#ff0000',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            container.add([mayhemGlow, mayhemBadge]);

            // Animação de brilho
            this.tweens.add({
                targets: mayhemGlow,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }

        // Área de clique - hitbox precisa
        container.setSize(width, height);
        container.setInteractive({ 
            useHandCursor: true,
            hitArea: new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        container.on('pointerover', () => {
            container.y = y + height/2 - 15;
            container.setScale(1.1);
            cardSprite.setTint(0xffffff);
            border.clear();
            border.lineStyle(4, 0xffd700, 1);
            border.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, 8);
        });

        container.on('pointerout', () => {
            container.y = y + height/2;
            container.setScale(1);
            cardSprite.clearTint();
            border.clear();
            border.lineStyle(3, rarityColor, 1);
            border.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, 8);
        });

        container.on('pointerdown', () => {
            if (!this.isAnimating && this.isPlayerTurn) {
                this.useCard(index);
            }
        });

        return container;
    }

    private startTurn(): void {
        const messages = this.arena.iniciarTurno();
        messages.forEach(msg => this.addLog(msg));

        this.isPlayerTurn = this.arena.turnoJogador1;
        this.updateStatusBars();
        this.updateCards();

        if (!this.isPlayerTurn && this.arena.batalhaAtiva) {
            // Turno da CPU - delay para feedback visual
            this.time.delayedCall(1200, () => this.cpuTurn());
        }
    }

    private executeAttack(attackNumber: 1 | 2): void {
        if (this.isAnimating || !this.isPlayerTurn) return;

        this.isAnimating = true;

        try {
            const result = this.arena.executarAtaque(attackNumber);
            this.addLog(result);
            this.animateAttack(true, () => {
                this.updateStatusBars();
                this.checkGameEnd();
                
                if (this.arena.batalhaAtiva) {
                    this.isAnimating = false;
                    this.startTurn();
                }
            });
        } catch (error) {
            if (error instanceof ManaInsuficienteError) {
                this.addLog(error.message);
                this.showMessage('⚠️ Mana Insuficiente!', 0xff4444);
            }
            this.isAnimating = false;
        }
    }

    private useCard(index: number): void {
        if (this.isAnimating || !this.isPlayerTurn) return;

        this.isAnimating = true;

        try {
            const result = this.arena.usarCarta(index);
            this.addLog(result);
            
            // Efeito visual de uso de carta
            this.showMessage('🃏 Carta Usada!', MEDIEVAL_THEME.gold);
            
            this.updateStatusBars();
            this.updateCards();
            this.checkGameEnd();

            if (this.arena.batalhaAtiva) {
                this.isAnimating = false;
                this.startTurn();
            }
        } catch (error) {
            if (error instanceof Error) {
                this.addLog(error.message);
                this.showMessage(error.message, 0xff4444);
            }
            this.isAnimating = false;
        }
    }

    private cpuTurn(): void {
        if (!this.arena.batalhaAtiva) return;

        this.isAnimating = true;

        // IA simples: escolhe ação aleatória
        const useCard = Math.random() < 0.3 && this.oponente.inventario.length > 0;

        if (useCard) {
            const cardIndex = Math.floor(Math.random() * this.oponente.inventario.length);
            const result = this.arena.usarCarta(cardIndex);
            this.addLog(`💀 [CPU] ${result}`);
        } else {
            // Escolher ataque
            const attackNum = Math.random() < 0.5 ? 1 : 2;
            try {
                const result = this.arena.executarAtaque(attackNum as 1 | 2);
                this.addLog(`💀 [CPU] ${result}`);
            } catch {
                // Se falhar, tentar o outro ataque
                const result = this.arena.executarAtaque(attackNum === 1 ? 2 : 1);
                this.addLog(`💀 [CPU] ${result}`);
            }
        }

        this.animateAttack(false, () => {
            this.updateStatusBars();
            this.checkGameEnd();

            if (this.arena.batalhaAtiva) {
                this.isAnimating = false;
                this.startTurn();
            }
        });
    }

    private animateAttack(isPlayer: boolean, callback: () => void): void {
        const startX = isPlayer ? 200 : 824;
        const endX = isPlayer ? 824 : 200;
        const startY = isPlayer ? 380 : 300;
        const endY = isPlayer ? 300 : 380;

        // Projétil mais elaborado
        const projectile = this.add.graphics();
        projectile.fillStyle(isPlayer ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 1);
        projectile.fillCircle(0, 0, 12);
        projectile.lineStyle(3, 0xffffff, 0.8);
        projectile.strokeCircle(0, 0, 12);
        projectile.setPosition(startX, startY);

        // Trilha de partículas
        this.tweens.add({
            targets: projectile,
            x: endX,
            y: endY,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                // Efeito de impacto
                this.cameras.main.shake(150, 0.015);
                
                // Flash no alvo
                const impact = this.add.circle(endX, endY, 30, isPlayer ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood, 0.8);
                this.tweens.add({
                    targets: impact,
                    scale: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => impact.destroy()
                });

                projectile.destroy();
                callback();
            }
        });
    }

    private showMessage(text: string, color: number): void {
        const message = this.add.text(512, 320, text, {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            color: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 270,
            scale: 1.2,
            duration: 1800,
            ease: 'Power2',
            onComplete: () => message.destroy()
        });
    }

    private checkGameEnd(): void {
        if (!this.arena.batalhaAtiva) {
            const vencedor = this.arena.vencedor;
            const jogadorVenceu = vencedor === this.jogador;

            // Mensagem dramática
            const endText = jogadorVenceu ? '🏆 VITÓRIA! 🏆' : '💀 DERROTA 💀';
            const endColor = jogadorVenceu ? MEDIEVAL_THEME.gold : MEDIEVAL_THEME.blood;
            
            this.showMessage(endText, endColor);

            this.time.delayedCall(2000, () => {
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
