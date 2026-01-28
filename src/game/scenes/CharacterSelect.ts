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
    spriteKey: string;
    factory: (nome: string) => Personagem;
}

/**
 * CharacterSelect Scene - Seleção de personagem com tema medieval
 */
export class CharacterSelect extends Scene {
    private classes: ClasseInfo[] = [];

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
                spriteKey: 'sprite-guerreiro',
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
                spriteKey: 'sprite-mago',
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
                spriteKey: 'sprite-arqueiro',
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
                spriteKey: 'sprite-paladino',
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
                spriteKey: 'sprite-necromante',
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
                spriteKey: 'sprite-feiticeiro',
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

        // Botão Voltar
        this.createBackButton();
    }

    private createBackground(): void {
        // Tentar usar o bg.png se existir
        try {
            const bg = this.add.image(960, 540, 'bg');
            bg.setDisplaySize(1920, 1080);
        } catch {
            // Fallback para gradiente
            const graphics = this.add.graphics();
            graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
            graphics.fillRect(0, 0, 1920, 1080);
        }

        // Overlay mais leve
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, 1920, 1080);
    }

    private createTitle(): void {
        // Título simples sem banner
        this.add.text(960, 40, 'ESCOLHA SEU CAMPEÃO', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '48px',
            color: '#d4af37',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
    }

    private createClassCards(): void {
        // Layout: 3 cards em cima, 3 embaixo - usando mais espaço
        const cardWidth = 380;
        const cardHeight = 380;
        const paddingX = 40;
        const paddingY = 25;
        const startY = 75;

        // Calcular posição X para centralizar 3 cards
        const rowWidth = (cardWidth * 3) + (paddingX * 2);
        const startX = (1920 - rowWidth) / 2;

        this.classes.forEach((classe, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const x = startX + (col * (cardWidth + paddingX));
            const y = startY + (row * (cardHeight + paddingY));
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

        // Zona interativa com limites exatos do card
        const hitZone = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0);
        hitZone.setInteractive({ useHandCursor: true });
        container.add(hitZone);

        // Fundo do card limpo
        const bg = this.add.graphics();
        bg.fillStyle(MEDIEVAL_THEME.parchment, 0.92);
        bg.fillRoundedRect(0, 0, width, height, 8);
        bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.5);
        bg.strokeRoundedRect(0, 0, width, height, 8);

        // Layout horizontal: sprite à esquerda, info à direita
        const spriteX = 70;
        const infoX = 150;

        // Fundo do sprite
        const iconBg = this.add.graphics();
        iconBg.fillStyle(classe.cor, 0.2);
        iconBg.fillCircle(spriteX, 85, 55);

        // Sprite animado do personagem
        const animKey = classe.spriteKey.replace('sprite-', '') + '-idle';
        const sprite = this.add.sprite(spriteX, 85, classe.spriteKey)
            .setOrigin(0.5)
            .setScale(5) // 16x16 -> 80x80
            .play(animKey);

        // Nome da classe
        const nome = this.add.text(infoX, 20, classe.nome.toUpperCase(), {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '28px',
            color: '#' + classe.cor.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });

        // Descrição COMPLETA
        const descricao = this.add.text(infoX, 55, classe.descricao, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '14px',
            color: '#5c3317',
            wordWrap: { width: width - infoX - 15 }
        });

        // Stats em linha
        const statsText = this.add.text(infoX, 130, 
            `❤️ ${classe.vida}    💧 ${classe.mana}`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '20px',
            color: '#3d2914'
        });

        // Linha separadora
        const separator = this.add.graphics();
        separator.lineStyle(2, MEDIEVAL_THEME.darkParchment, 0.5);
        separator.lineBetween(20, 175, width - 20, 175);

        // Ataques completos
        const ataquesText = this.add.text(20, 190, 
            `⚔️ ${classe.ataque1}\n🔥 ${classe.ataque2}`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '18px',
            color: '#3d2914',
            lineSpacing: 10,
            wordWrap: { width: width - 40 }
        });

        // Indicador "Clique para selecionar" no lugar do botão
        const hintText = this.add.text(width / 2, height - 25, '👆 Clique para selecionar', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '16px',
            color: '#8b7355',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        container.add([bg, iconBg, sprite, nome, descricao, statsText, separator, ataquesText, hintText]);

        // Eventos de hover na zona interativa (hitZone já é interativo)
        hitZone.on('pointerover', () => {
            // Destacar com borda dourada
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.parchment, 1);
            bg.fillRoundedRect(0, 0, width, height, 8);
            bg.lineStyle(4, MEDIEVAL_THEME.gold, 1);
            bg.strokeRoundedRect(0, 0, width, height, 8);
            container.setScale(1.02);
        });

        hitZone.on('pointerout', () => {
            // Restaurar estilo normal
            bg.clear();
            bg.fillStyle(MEDIEVAL_THEME.parchment, 0.92);
            bg.fillRoundedRect(0, 0, width, height, 8);
            bg.lineStyle(2, MEDIEVAL_THEME.darkGold, 0.5);
            bg.strokeRoundedRect(0, 0, width, height, 8);
            container.setScale(1);
        });

        hitZone.on('pointerdown', () => {
            this.selectClass(classe);
        });

        return container;
    }

    private selectClass(classe: ClasseInfo): void {
        // Efeito de seleção épico
        this.cameras.main.flash(400, 255, 215, 0);
        
        // Som de confirmação (visual)
        const selectText = this.add.text(960, 540, `⚔️ ${classe.nome.toUpperCase()} ⚔️`, {
            fontFamily: 'EightBitDragon, Georgia, serif',
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
            fontFamily: 'EightBitDragon, Georgia, serif',
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
