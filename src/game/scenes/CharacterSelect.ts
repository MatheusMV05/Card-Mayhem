import { Scene, GameObjects } from 'phaser';
import { ClassePersonagem } from '../enums';
import { Guerreiro, Mago, Arqueiro, Paladino, Necromante, Feiticeiro, Personagem } from '../entities';

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
    factory: (nome: string) => Personagem;
}

/**
 * CharacterSelect Scene - Seleção de personagem
 */
export class CharacterSelect extends Scene {
    private classes: ClasseInfo[] = [];
    private previewContainer!: GameObjects.Container;
    private classCards: GameObjects.Container[] = [];

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
                descricao: 'Alta durabilidade e força bruta. Não usa mana.',
                cor: 0xb22222,
                factory: (nome: string) => new Guerreiro(nome)
            },
            {
                nome: ClassePersonagem.Mago,
                vida: 80,
                mana: 100,
                ataque1: 'Meditar (+25 mana)',
                ataque2: 'Bola de Fogo (54 dano)',
                descricao: 'Glass Cannon. Alto dano mágico, baixa vida.',
                cor: 0x4169e1,
                factory: (nome: string) => new Mago(nome)
            },
            {
                nome: ClassePersonagem.Arqueiro,
                vida: 100,
                mana: 50,
                ataque1: 'Disparo Ágil (15+crítico)',
                ataque2: 'Flecha Precisa (25 dano)',
                descricao: 'Equilibrado. Chance de crítico e precisão.',
                cor: 0x228b22,
                factory: (nome: string) => new Arqueiro(nome)
            },
            {
                nome: ClassePersonagem.Paladino,
                vida: 130,
                mana: 60,
                ataque1: 'Golpe de Fé (15+cura)',
                ataque2: 'Escudo Divino (-50% dano)',
                descricao: 'Tank com sustentação. Cura e defesa.',
                cor: 0xffd700,
                factory: (nome: string) => new Paladino(nome)
            },
            {
                nome: ClassePersonagem.Necromante,
                vida: 90,
                mana: 80,
                ataque1: 'Toque Debilitante (DoT)',
                ataque2: 'Sacrifício (35 dano)',
                descricao: 'Alto risco. Dano persistente e sacrifício.',
                cor: 0x800080,
                factory: (nome: string) => new Necromante(nome)
            },
            {
                nome: ClassePersonagem.Feiticeiro,
                vida: 85,
                mana: 120,
                ataque1: 'Dardo Arcano (20 puro)',
                ataque2: 'Fluxo de Mana (1.5x)',
                descricao: 'Combos de mana. Ignora defesas.',
                cor: 0x9400d3,
                factory: (nome: string) => new Feiticeiro(nome)
            }
        ];
    }

    create(): void {
        // Fundo
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, 1024, 768);

        // Título
        this.add.text(512, 50, 'Escolha seu Personagem', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#e94560'
        }).setOrigin(0.5);

        // Criar cards das classes
        this.createClassCards();

        // Container de preview
        this.previewContainer = this.add.container(512, 600);
        this.previewContainer.setVisible(false);

        // Botão Voltar
        this.createBackButton();
    }

    private createClassCards(): void {
        const startX = 100;
        const startY = 180;
        const cardWidth = 140;
        const cardHeight = 200;
        const padding = 15;

        this.classes.forEach((classe, index) => {
            const x = startX + (index * (cardWidth + padding));
            const y = startY;

            const card = this.createClassCard(x, y, cardWidth, cardHeight, classe);
            this.classCards.push(card);
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

        // Fundo do card
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a4a, 1);
        bg.fillRoundedRect(0, 0, width, height, 10);
        bg.lineStyle(3, classe.cor, 1);
        bg.strokeRoundedRect(0, 0, width, height, 10);

        // Ícone da classe (símbolo simples)
        const icon = this.add.graphics();
        icon.fillStyle(classe.cor, 1);
        icon.fillCircle(width / 2, 50, 30);

        // Nome da classe
        const nome = this.add.text(width / 2, 100, classe.nome, {
            fontFamily: 'Arial Black',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Stats
        const stats = this.add.text(width / 2, 140, `HP: ${classe.vida}\nMana: ${classe.mana}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, icon, nome, stats]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        // Eventos
        container.on('pointerover', () => {
            this.showPreview(classe);
            this.tweens.add({
                targets: container,
                y: y - 10,
                duration: 150
            });
        });

        container.on('pointerout', () => {
            this.previewContainer.setVisible(false);
            this.tweens.add({
                targets: container,
                y: y,
                duration: 150
            });
        });

        container.on('pointerdown', () => {
            this.selectClass(classe);
        });

        return container;
    }

    private showPreview(classe: ClasseInfo): void {
        this.previewContainer.removeAll(true);

        // Fundo do preview
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.95);
        bg.fillRoundedRect(-400, -80, 800, 160, 15);
        bg.lineStyle(2, classe.cor, 1);
        bg.strokeRoundedRect(-400, -80, 800, 160, 15);

        // Nome
        const nome = this.add.text(-380, -60, classe.nome, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#' + classe.cor.toString(16).padStart(6, '0')
        });

        // Descrição
        const descricao = this.add.text(-380, -25, classe.descricao, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        });

        // Stats
        const statsText = this.add.text(-380, 10, 
            `❤️ Vida: ${classe.vida}  |  💧 Mana: ${classe.mana}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#88ff88'
        });

        // Ataques
        const ataques = this.add.text(-380, 40,
            `⚔️ ${classe.ataque1}  |  🔥 ${classe.ataque2}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffcc00'
        });

        this.previewContainer.add([bg, nome, descricao, statsText, ataques]);
        this.previewContainer.setVisible(true);
    }

    private selectClass(classe: ClasseInfo): void {
        // Efeito de seleção
        this.cameras.main.flash(300, 255, 255, 255, false);

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

    private createBackButton(): void {
        const btn = this.add.text(60, 40, '← Voltar', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#e94560'
        }).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#ff6b8a'));
        btn.on('pointerout', () => btn.setColor('#e94560'));
        btn.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}
