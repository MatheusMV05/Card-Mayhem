import { Scene, GameObjects } from 'phaser';
import { ClassePersonagem } from '../enums';
import { Guerreiro, Mago, Arqueiro, Paladino, Necromante, Feiticeiro, Personagem } from '../entities';

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
    wood: 0x654321
};

/**
 * Informações das classes para exibição
 */
interface ClasseInfo {
    nome: ClassePersonagem;
    vida: number;
    mana: number;
    ataque1: string;
    ataque2: string;
    descricao: string;
    cor: number;
    icone: string;
    factory: (nome: string) => Personagem;
}

/**
 * CharacterSelect Scene - Seleção de personagem com tema medieval
 */
export class CharacterSelect extends Scene {
    private classes: ClasseInfo[] = [];
    private previewContainer!: GameObjects.Container;
    private selectedClass: ClasseInfo | null = null;

    constructor() {
        super('CharacterSelect');
        this.initClasses();
    }

    private initClasses(): void {
        this.classes = [
            {
                nome: ClassePersonagem.Guerreiro,
                vida: 150,
                mana: 0,
                ataque1: 'Golpe Padrão (18 dano)',
                ataque2: 'Golpe Brutal (36 dano)',
                descricao: 'Mestre da espada com alta resistência. Não depende de mana, usa pura força bruta.',
                cor: 0xb22222,
                icone: '⚔️',
                factory: (nome: string) => new Guerreiro(nome)
            },
            {
                nome: ClassePersonagem.Mago,
                vida: 80,
                mana: 100,
                ataque1: 'Meditar (+25 mana)',
                ataque2: 'Bola de Fogo (54 dano)',
                descricao: 'Arquimago dominador das chamas. Frágil mas devastador.',
                cor: 0x4169e1,
                icone: '🔮',
                factory: (nome: string) => new Mago(nome)
            },
            {
                nome: ClassePersonagem.Arqueiro,
                vida: 100,
                mana: 50,
                ataque1: 'Disparo Ágil (15+crítico)',
                ataque2: 'Flecha Precisa (25 dano)',
                descricao: 'Atirador de elite com olhos de águia. Equilíbrio entre dano e sobrevivência.',
                cor: 0x228b22,
                icone: '🏹',
                factory: (nome: string) => new Arqueiro(nome)
            },
            {
                nome: ClassePersonagem.Paladino,
                vida: 130,
                mana: 60,
                ataque1: 'Golpe de Fé (15+cura)',
                ataque2: 'Escudo Divino (-50% dano)',
                descricao: 'Cavaleiro sagrado protetor dos inocentes. Sustentação e defesa.',
                cor: 0xffd700,
                icone: '🛡️',
                factory: (nome: string) => new Paladino(nome)
            },
            {
                nome: ClassePersonagem.Necromante,
                vida: 90,
                mana: 80,
                ataque1: 'Toque Debilitante (DoT)',
                ataque2: 'Sacrifício (35 dano)',
                descricao: 'Senhor das trevas que comanda a morte. Alto risco, alta recompensa.',
                cor: 0x800080,
                icone: '💀',
                factory: (nome: string) => new Necromante(nome)
            },
            {
                nome: ClassePersonagem.Feiticeiro,
                vida: 85,
                mana: 120,
                ataque1: 'Dardo Arcano (20 puro)',
                ataque2: 'Fluxo de Mana (1.5x)',
                descricao: 'Tecelão de feitiços ancestrais. Ignora defesas com magia pura.',
                cor: 0x9400d3,
                icone: '✨',
                factory: (nome: string) => new Feiticeiro(nome)
            }
        ];
    }

    create(): void {
        // Fundo com imagem
        this.createBackground();

        // Título medieval
        this.createTitle();

        // Cards das classes
        this.createClassCards();

        // Container de preview detalhado
        this.previewContainer = this.add.container(512, 620);
        this.previewContainer.setVisible(false);

        // Botão Voltar
        this.createBackButton();
    }

    private createBackground(): void {
        // Tentar usar o bg.png se existir
        try {
            const bg = this.add.image(512, 384, 'bg');
            bg.setDisplaySize(1024, 768);
        } catch {
            // Fallback para gradiente
            const graphics = this.add.graphics();
            graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
            graphics.fillRect(0, 0, 1024, 768);
        }

        // Overlay escuro
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.5);
        overlay.fillRect(0, 0, 1024, 768);
    }

    private createTitle(): void {
        // Banner do título
        const titleBanner = this.add.graphics();
        titleBanner.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        titleBanner.fillRoundedRect(212, 20, 600, 80, 10);
        titleBanner.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        titleBanner.strokeRoundedRect(212, 20, 600, 80, 10);
        titleBanner.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.7);
        titleBanner.strokeRoundedRect(222, 30, 580, 60, 6);

        this.add.text(512, 60, '⚔️ ESCOLHA SEU CAMPEÃO ⚔️', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    private createClassCards(): void {
        const startX = 85;
        const startY = 140;
        const cardWidth = 150;
        const cardHeight = 280;
        const padding = 12;

        this.classes.forEach((classe, index) => {
            const x = startX + (index * (cardWidth + padding));
            const y = startY;
            this.createClassCard(x, y, cardWidth, cardHeight, classe);
        });
    }

    private createClassCard(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        classe: ClasseInfo
    ): GameObjects.Container {
        const container = this.add.container(x, y);

        // Fundo do card estilo pergaminho
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.parchment, 0.95);
        bg.fillRoundedRect(0, 0, width, height, 12);
        bg.lineStyle(4, classe.cor, 1);
        bg.strokeRoundedRect(0, 0, width, height, 12);
        bg.lineStyle(2, MEDIEVAL_THEME.darkParchment, 0.8);
        bg.strokeRoundedRect(6, 6, width - 12, height - 12, 8);

        // Ícone grande da classe
        const iconBg = this.add.graphics();
        iconBg.fillStyle(classe.cor, 0.2);
        iconBg.fillCircle(width / 2, 55, 40);
        iconBg.lineStyle(3, classe.cor, 1);
        iconBg.strokeCircle(width / 2, 55, 40);

        const icon = this.add.text(width / 2, 55, classe.icone, {
            fontSize: '40px'
        }).setOrigin(0.5);

        // Nome da classe
        const nome = this.add.text(width / 2, 115, classe.nome, {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#' + classe.cor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Linha separadora
        const separator = this.add.graphics();
        separator.lineStyle(2, classe.cor, 0.5);
        separator.lineBetween(15, 135, width - 15, 135);

        // Stats
        const statsText = this.add.text(width / 2, 160, 
            `❤️ ${classe.vida}\n💧 ${classe.mana}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#3d2914',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Ataques resumidos
        const ataquesText = this.add.text(width / 2, 220, 
            `⚔️ ${classe.ataque1.split('(')[0].trim()}\n🔥 ${classe.ataque2.split('(')[0].trim()}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '10px',
            color: '#5c3317',
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: width - 20 }
        }).setOrigin(0.5);

        // Botão "Escolher"
        const btnY = height - 30;
        const btnBg = this.add.graphics();
        btnBg.fillStyle(classe.cor, 1);
        btnBg.fillRoundedRect(15, btnY - 15, width - 30, 28, 6);

        const btnText = this.add.text(width / 2, btnY, 'ESCOLHER', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, iconBg, icon, nome, separator, statsText, ataquesText, btnBg, btnText]);
        container.setSize(width, height);
        container.setInteractive({ 
            useHandCursor: true,
            hitArea: new Phaser.Geom.Rectangle(0, 0, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
        });

        // Eventos de hover
        container.on('pointerover', () => {
            this.showPreview(classe);
            this.tweens.add({
                targets: container,
                y: y - 15,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
            
            // Destacar borda
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.parchment, 1);
            bg.fillRoundedRect(0, 0, width, height, 12);
            bg.lineStyle(5, MEDIEVAL_THEME.gold, 1);
            bg.strokeRoundedRect(0, 0, width, height, 12);
            bg.lineStyle(2, classe.cor, 1);
            bg.strokeRoundedRect(6, 6, width - 12, height - 12, 8);
        });

        container.on('pointerout', () => {
            this.previewContainer.setVisible(false);
            this.tweens.add({
                targets: container,
                y: y,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
            
            // Restaurar borda
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.parchment, 0.95);
            bg.fillRoundedRect(0, 0, width, height, 12);
            bg.lineStyle(4, classe.cor, 1);
            bg.strokeRoundedRect(0, 0, width, height, 12);
            bg.lineStyle(2, MEDIEVAL_THEME.darkParchment, 0.8);
            bg.strokeRoundedRect(6, 6, width - 12, height - 12, 8);
        });

        container.on('pointerdown', () => {
            this.selectClass(classe);
        });

        return container;
    }

    private showPreview(classe: ClasseInfo): void {
        this.previewContainer.removeAll(true);
        this.selectedClass = classe;

        // Fundo do preview estilo pergaminho grande
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.leather, 0.95);
        bg.fillRoundedRect(-450, -70, 900, 140, 12);
        bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
        bg.strokeRoundedRect(-450, -70, 900, 140, 12);
        bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.6);
        bg.strokeRoundedRect(-440, -60, 880, 120, 8);

        // Ícone e nome
        const icon = this.add.text(-420, -40, classe.icone, {
            fontSize: '50px'
        });

        const nome = this.add.text(-350, -45, classe.nome.toUpperCase(), {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: '#' + classe.cor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Descrição
        const descricao = this.add.text(-350, -10, classe.descricao, {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f4e4bc',
            wordWrap: { width: 350 }
        });

        // Stats detalhados
        const statsBox = this.add.graphics();
        statsBox.fillStyle(0x000000, 0.3);
        statsBox.fillRoundedRect(50, -55, 180, 110, 8);

        const stats = this.add.text(140, -45, 
            `❤️ Vida: ${classe.vida}\n💧 Mana: ${classe.mana}\n\n⚔️ ${classe.ataque1}\n🔥 ${classe.ataque2}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#ffffff',
            lineSpacing: 6
        }).setOrigin(0.5, 0);

        // Botão confirmar
        const confirmBtn = this.add.graphics();
        confirmBtn.fillStyle(classe.cor, 1);
        confirmBtn.fillRoundedRect(280, -45, 150, 90, 10);
        confirmBtn.lineStyle(3, MEDIEVAL_THEME.gold, 1);
        confirmBtn.strokeRoundedRect(280, -45, 150, 90, 10);

        const confirmText = this.add.text(355, 0, '⚔️\nCOMBATER!', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Tornar botão clicável
        const confirmHitArea = this.add.rectangle(355, 0, 150, 90, 0x000000, 0);
        confirmHitArea.setInteractive({ useHandCursor: true });
        confirmHitArea.on('pointerdown', () => {
            if (this.selectedClass) {
                this.selectClass(this.selectedClass);
            }
        });
        confirmHitArea.on('pointerover', () => {
            confirmBtn.clear();
            confirmBtn.fillStyle(MEDIEVAL_THEME.gold, 1);
            confirmBtn.fillRoundedRect(280, -45, 150, 90, 10);
            confirmBtn.lineStyle(3, 0xffffff, 1);
            confirmBtn.strokeRoundedRect(280, -45, 150, 90, 10);
        });
        confirmHitArea.on('pointerout', () => {
            confirmBtn.clear();
            confirmBtn.fillStyle(classe.cor, 1);
            confirmBtn.fillRoundedRect(280, -45, 150, 90, 10);
            confirmBtn.lineStyle(3, MEDIEVAL_THEME.gold, 1);
            confirmBtn.strokeRoundedRect(280, -45, 150, 90, 10);
        });

        this.previewContainer.add([bg, icon, nome, descricao, statsBox, stats, confirmBtn, confirmText, confirmHitArea]);
        this.previewContainer.setVisible(true);
    }

    private selectClass(classe: ClasseInfo): void {
        // Efeito de seleção épico
        this.cameras.main.flash(400, 255, 215, 0);
        
        // Som de confirmação (visual)
        const selectText = this.add.text(512, 384, `⚔️ ${classe.nome.toUpperCase()} ⚔️`, {
            fontFamily: 'Georgia, serif',
            fontSize: '48px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.tweens.add({
            targets: selectText,
            scale: 1.5,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                selectText.destroy();
                
                // Criar personagem do jogador
                const jogador = classe.factory('Jogador');
                
                // Criar oponente aleatório
                const oponenteClasse = Phaser.Utils.Array.GetRandom(this.classes);
                const oponente = oponenteClasse.factory('CPU');

                // Passar para a cena de batalha
                this.scene.start('Battle', {
                    jogador,
                    oponente,
                    jogadorClasse: classe,
                    oponenteClasse
                });
            }
        });
    }

    private createBackButton(): void {
        const btnContainer = this.add.container(80, 45);

        const btnBg = this.add.graphics();
        btnBg.fillStyle(MEDIEVAL_THEME.leather, 0.9);
        btnBg.fillRoundedRect(-60, -25, 120, 50, 8);
        btnBg.lineStyle(2, MEDIEVAL_THEME.gold, 1);
        btnBg.strokeRoundedRect(-60, -25, 120, 50, 8);

        const btnText = this.add.text(0, 0, '← Voltar', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#d4af37',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btnContainer.add([btnBg, btnText]);
        btnContainer.setSize(120, 50);
        btnContainer.setInteractive({ useHandCursor: true });

        btnContainer.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(MEDIEVAL_THEME.gold, 1);
            btnBg.fillRoundedRect(-60, -25, 120, 50, 8);
            btnText.setColor('#5c3317');
        });

        btnContainer.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(MEDIEVAL_THEME.leather, 0.9);
            btnBg.fillRoundedRect(-60, -25, 120, 50, 8);
            btnBg.lineStyle(2, MEDIEVAL_THEME.gold, 1);
            btnBg.strokeRoundedRect(-60, -25, 120, 50, 8);
            btnText.setColor('#d4af37');
        });

        btnContainer.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}
