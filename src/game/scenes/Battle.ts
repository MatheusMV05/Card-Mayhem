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
 * Battle Scene - Cena principal de batalha
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

        // Fundo
        this.createBackground();

        // UI de status
        this.createStatusBars();

        // Área de log
        this.createLogArea();

        // Personagens visuais
        this.createCharacterVisuals();

        // Área de ações (ataques e cartas)
        this.createActionArea();

        // Iniciar primeiro turno
        this.startTurn();
    }

    private createBackground(): void {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f23, 0x0f0f23, 1);
        graphics.fillRect(0, 0, 1024, 768);

        // Arena floor
        graphics.fillStyle(0x2a2a4a, 0.5);
        graphics.fillEllipse(512, 400, 800, 200);
    }

    private createStatusBars(): void {
        // === JOGADOR (esquerda inferior) ===
        this.add.container(50, 500);

        // Nome do jogador
        this.add.text(50, 470, `${this.jogador.nome} (${this.jogador.classe})`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#' + this.jogadorCor.toString(16).padStart(6, '0')
        });

        // Barra de vida do jogador
        this.jogadorHealthBar = this.add.graphics();
        this.jogadorHealthText = this.add.text(250, 500, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        });

        // Barra de mana do jogador
        this.jogadorManaBar = this.add.graphics();
        this.jogadorManaText = this.add.text(250, 525, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        });

        // === OPONENTE (direita superior) ===
        this.add.text(974, 80, `${this.oponente.nome} (${this.oponente.classe})`, {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#' + this.oponenteCor.toString(16).padStart(6, '0')
        }).setOrigin(1, 0);

        // Barra de vida do oponente
        this.oponenteHealthBar = this.add.graphics();
        this.oponenteHealthText = this.add.text(974, 110, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Barra de mana do oponente
        this.oponenteManaBar = this.add.graphics();
        this.oponenteManaText = this.add.text(974, 135, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Indicador de turno
        this.turnoText = this.add.text(512, 30, 'Turno 1', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#e94560'
        }).setOrigin(0.5);

        this.updateStatusBars();
    }

    private updateStatusBars(): void {
        // Jogador
        const jogadorHpPercent = this.jogador.vida / this.jogador.vidaMaxima;
        const jogadorManaPercent = this.jogador.manaMaxima > 0 
            ? this.jogador.mana / this.jogador.manaMaxima 
            : 0;

        this.jogadorHealthBar.clear();
        this.jogadorHealthBar.fillStyle(0x333333, 1);
        this.jogadorHealthBar.fillRoundedRect(50, 500, 200, 20, 5);
        this.jogadorHealthBar.fillStyle(0x22c55e, 1);
        this.jogadorHealthBar.fillRoundedRect(50, 500, 200 * jogadorHpPercent, 20, 5);
        this.jogadorHealthText.setText(`${this.jogador.vida}/${this.jogador.vidaMaxima}`);

        this.jogadorManaBar.clear();
        this.jogadorManaBar.fillStyle(0x333333, 1);
        this.jogadorManaBar.fillRoundedRect(50, 525, 200, 15, 5);
        if (this.jogador.manaMaxima > 0) {
            this.jogadorManaBar.fillStyle(0x3b82f6, 1);
            this.jogadorManaBar.fillRoundedRect(50, 525, 200 * jogadorManaPercent, 15, 5);
            this.jogadorManaText.setText(`${this.jogador.mana}/${this.jogador.manaMaxima}`);
        } else {
            this.jogadorManaText.setText('Sem Mana');
        }

        // Oponente
        const oponenteHpPercent = this.oponente.vida / this.oponente.vidaMaxima;
        const oponenteManaPercent = this.oponente.manaMaxima > 0 
            ? this.oponente.mana / this.oponente.manaMaxima 
            : 0;

        this.oponenteHealthBar.clear();
        this.oponenteHealthBar.fillStyle(0x333333, 1);
        this.oponenteHealthBar.fillRoundedRect(774, 110, 200, 20, 5);
        this.oponenteHealthBar.fillStyle(0xef4444, 1);
        this.oponenteHealthBar.fillRoundedRect(774, 110, 200 * oponenteHpPercent, 20, 5);
        this.oponenteHealthText.setText(`${this.oponente.vida}/${this.oponente.vidaMaxima}`);

        this.oponenteManaBar.clear();
        this.oponenteManaBar.fillStyle(0x333333, 1);
        this.oponenteManaBar.fillRoundedRect(774, 135, 200, 15, 5);
        if (this.oponente.manaMaxima > 0) {
            this.oponenteManaBar.fillStyle(0x3b82f6, 1);
            this.oponenteManaBar.fillRoundedRect(774, 135, 200 * oponenteManaPercent, 15, 5);
            this.oponenteManaText.setText(`${this.oponente.mana}/${this.oponente.manaMaxima}`);
        } else {
            this.oponenteManaText.setText('Sem Mana');
        }

        // Turno
        this.turnoText.setText(`Turno ${this.arena.turnoAtual}`);
    }

    private createLogArea(): void {
        // Área de log no centro-direita
        this.logContainer = this.add.container(750, 200);

        const logBg = this.add.graphics();
        logBg.fillStyle(0x1a1a2e, 0.9);
        logBg.fillRoundedRect(0, 0, 260, 200, 10);
        logBg.lineStyle(2, 0xe94560, 0.5);
        logBg.strokeRoundedRect(0, 0, 260, 200, 10);

        const logTitle = this.add.text(130, 15, 'Histórico', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#e94560'
        }).setOrigin(0.5);

        this.logContainer.add([logBg, logTitle]);
    }

    private addLog(message: string): void {
        // Adicionar nova mensagem
        
        if (this.logTexts.length >= 7) {
            // Remover mensagem mais antiga
            const oldText = this.logTexts.shift();
            oldText?.destroy();
            
            // Mover mensagens para cima
            this.logTexts.forEach((text, index) => {
                text.y = 40 + (index * 20);
            });
        }

        const newLog = this.add.text(10, this.logTexts.length * 20 + 40, message, {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#cccccc',
            wordWrap: { width: 240 }
        });

        this.logTexts.push(newLog);
        this.logContainer.add(newLog);
    }

    private createCharacterVisuals(): void {
        // Jogador (esquerda)
        const jogadorVisual = this.add.graphics();
        jogadorVisual.fillStyle(this.jogadorCor, 1);
        jogadorVisual.fillCircle(250, 350, 50);
        jogadorVisual.lineStyle(4, 0xffffff, 0.5);
        jogadorVisual.strokeCircle(250, 350, 50);

        this.add.text(250, 350, this.jogador.classe.charAt(0), {
            fontFamily: 'Arial Black',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Oponente (direita)
        const oponenteVisual = this.add.graphics();
        oponenteVisual.fillStyle(this.oponenteCor, 1);
        oponenteVisual.fillCircle(774, 250, 50);
        oponenteVisual.lineStyle(4, 0xffffff, 0.5);
        oponenteVisual.strokeCircle(774, 250, 50);

        this.add.text(774, 250, this.oponente.classe.charAt(0), {
            fontFamily: 'Arial Black',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // HP acima do oponente
        this.add.text(774, 180, `❤️ ${this.oponente.vida}`, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ef4444'
        }).setOrigin(0.5);
    }

    private createActionArea(): void {
        // Container principal de ações (parte inferior)
        this.actionContainer = this.add.container(0, 580);

        // Fundo da área de ações
        const actionBg = this.add.graphics();
        actionBg.fillStyle(0x1a1a2e, 0.95);
        actionBg.fillRoundedRect(50, 0, 924, 170, 15);
        actionBg.lineStyle(2, 0xe94560, 0.5);
        actionBg.strokeRoundedRect(50, 0, 924, 170, 15);
        this.actionContainer.add(actionBg);

        // Título "Ataques"
        const ataquesTitle = this.add.text(170, 15, 'Ataques', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#e94560'
        }).setOrigin(0.5);
        this.actionContainer.add(ataquesTitle);

        // Título "Cartas"
        const cartasTitle = this.add.text(680, 15, 'Cartas de Suporte', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#e94560'
        }).setOrigin(0.5);
        this.actionContainer.add(cartasTitle);

        // Separador
        const separator = this.add.graphics();
        separator.lineStyle(2, 0x444444, 1);
        separator.lineBetween(380, 10, 380, 160);
        this.actionContainer.add(separator);

        // Criar botões de ataque
        this.createAttackButtons();

        // Criar área de cartas
        this.cardsContainer = this.add.container(400, 40);
        this.actionContainer.add(this.cardsContainer);
        this.updateCards();
    }

    private createAttackButtons(): void {
        // Ataque 1
        const atk1Btn = this.createActionButton(
            120, 80, 
            this.jogador.nomeAtaque1, 
            this.jogador.descricaoAtaque1,
            0,
            () => this.executeAttack(1)
        );
        this.actionContainer.add(atk1Btn);

        // Ataque 2
        const custoMana = this.jogador.custoManaAtaque2;
        const custoText = custoMana > 0 ? ` (${custoMana} mana)` : '';
        const atk2Btn = this.createActionButton(
            280, 80,
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
        _manaCost: number,
        callback: () => void
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const width = 140;
        const height = 100;

        // Fundo
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a4a, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
        bg.lineStyle(2, 0xe94560, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);

        // Título
        const titleText = this.add.text(0, -30, title, {
            fontFamily: 'Arial Black',
            fontSize: '11px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        // Descrição
        const descText = this.add.text(0, 15, description, {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: width - 15 }
        }).setOrigin(0.5);

        container.add([bg, titleText, descText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x3a3a5a, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
            bg.lineStyle(2, 0xff6b8a, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a4a, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 8);
            bg.lineStyle(2, 0xe94560, 1);
            bg.strokeRoundedRect(-width/2, -height/2, width, height, 8);
        });

        container.on('pointerdown', () => {
            if (!this.isAnimating && this.isPlayerTurn) {
                callback();
            }
        });

        return container;
    }

    private updateCards(): void {
        this.cardsContainer.removeAll(true);

        const cards = this.jogador.inventario;
        const cardWidth = 120;
        const cardHeight = 110;
        const padding = 10;

        cards.forEach((card, index) => {
            const x = index * (cardWidth + padding);
            const cardContainer = this.createCardUI(x, 0, cardWidth, cardHeight, card, index);
            this.cardsContainer.add(cardContainer);
        });
    }

    private createCardUI(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        card: IItem, 
        index: number
    ): GameObjects.Container {
        const container = this.add.container(x, y);
        const rarityColor = RaridadeCores[card.raridade] || 0x888888;

        // Fundo
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRoundedRect(0, 0, width, height, 8);
        bg.lineStyle(3, rarityColor, 1);
        bg.strokeRoundedRect(0, 0, width, height, 8);

        // Raridade (topo)
        const rarityText = this.add.text(width/2, 10, card.raridade, {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#' + rarityColor.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        // Nome
        const nameText = this.add.text(width/2, 35, card.nome, {
            fontFamily: 'Arial Black',
            fontSize: '10px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        // Descrição
        const descText = this.add.text(width/2, 70, card.descricao, {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        // Indicador Mayhem
        if (card.isMayhem) {
            const mayhemBadge = this.add.text(width/2, height - 12, '⚡ MAYHEM', {
                fontFamily: 'Arial Black',
                fontSize: '8px',
                color: '#ff0040'
            }).setOrigin(0.5);
            container.add(mayhemBadge);
        }

        container.add([bg, rarityText, nameText, descText]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            container.y = y - 5;
            bg.clear();
            bg.fillStyle(0x2a2a4a, 1);
            bg.fillRoundedRect(0, 0, width, height, 8);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeRoundedRect(0, 0, width, height, 8);
        });

        container.on('pointerout', () => {
            container.y = y;
            bg.clear();
            bg.fillStyle(0x1a1a2e, 1);
            bg.fillRoundedRect(0, 0, width, height, 8);
            bg.lineStyle(3, rarityColor, 1);
            bg.strokeRoundedRect(0, 0, width, height, 8);
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
            // Turno da CPU
            this.time.delayedCall(1000, () => this.cpuTurn());
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
                this.showMessage('Mana Insuficiente!', 0xff0000);
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
                this.showMessage(error.message, 0xff0000);
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
            this.addLog(`[CPU] ${result}`);
        } else {
            // Escolher ataque
            const attackNum = Math.random() < 0.5 ? 1 : 2;
            try {
                const result = this.arena.executarAtaque(attackNum as 1 | 2);
                this.addLog(`[CPU] ${result}`);
            } catch {
                // Se falhar, tentar o outro ataque
                const result = this.arena.executarAtaque(attackNum === 1 ? 2 : 1);
                this.addLog(`[CPU] ${result}`);
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
        const startX = isPlayer ? 250 : 774;
        const endX = isPlayer ? 774 : 250;
        const startY = isPlayer ? 350 : 250;
        const endY = isPlayer ? 250 : 350;

        const projectile = this.add.circle(startX, startY, 10, 0xe94560);

        this.tweens.add({
            targets: projectile,
            x: endX,
            y: endY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Efeito de impacto
                this.cameras.main.shake(100, 0.01);
                projectile.destroy();
                callback();
            }
        });
    }

    private showMessage(text: string, color: number): void {
        const message = this.add.text(512, 300, text, {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 250,
            duration: 1500,
            onComplete: () => message.destroy()
        });
    }

    private checkGameEnd(): void {
        if (!this.arena.batalhaAtiva) {
            const vencedor = this.arena.vencedor;
            const jogadorVenceu = vencedor === this.jogador;

            this.time.delayedCall(1000, () => {
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
