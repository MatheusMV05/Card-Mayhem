import { Scene } from 'phaser';

/**
 * Preloader Scene - Carrega todos os assets do jogo
 */
export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Criar fundo gradiente
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, 1920, 1080);

        // Barra de progresso - contorno
        this.add.rectangle(960, 540, 468, 32).setStrokeStyle(2, 0xe94560);

        // Barra de progresso
        const bar = this.add.rectangle(960 - 230, 540, 4, 28, 0xe94560);

        // Texto de loading
        const loadingText = this.add.text(960, 340, 'Carregando...', {
            fontFamily: 'EightBitDragon, Georgia, serif',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Atualizar barra de progresso
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
            loadingText.setText(`Carregando... ${Math.floor(progress * 100)}%`);
        });
    }

    preload() {
        this.load.setPath('assets');
        
        // Carregar sprites das cartas
        this.load.image('card-gray', 'CardGray.png');      // Comum
        this.load.image('card-green', 'CardGreen.png');    // Incomum
        this.load.image('card-blue', 'CardBlue.png');      // Raro
        this.load.image('card-yellow', 'Cardyellow.png');  // Épico / Lendário
        this.load.image('card-red', 'CardRed.png');        // Mayhem / Super Mayhem
        
        // Carregar backgrounds
        this.load.image('throne-room', 'throne room.png');
        this.load.image('bg', 'bg.png');
        
        // Carregar spritesheets dos personagens (16x16, 4 frames cada, exceto Paladino com 5)
        this.load.spritesheet('sprite-guerreiro', 'Guerreiro.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('sprite-mago', 'Mago.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('sprite-arqueiro', 'Arqueiro.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('sprite-paladino', 'Paladino.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('sprite-necromante', 'Necromante.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('sprite-feiticeiro', 'Feiticeiro.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        // Criar animações para cada personagem
        this.createCharacterAnimations();
        
        // Após carregar, ir para o menu principal
        this.scene.start('MainMenu');
    }

    private createCharacterAnimations(): void {
        // Animações idle (4 frames, exceto Paladino com 5)
        const characters = [
            { key: 'guerreiro', frames: 4 },
            { key: 'mago', frames: 4 },
            { key: 'arqueiro', frames: 4 },
            { key: 'paladino', frames: 5 },
            { key: 'necromante', frames: 4 },
            { key: 'feiticeiro', frames: 4 }
        ];

        characters.forEach(char => {
            this.anims.create({
                key: `${char.key}-idle`,
                frames: this.anims.generateFrameNumbers(`sprite-${char.key}`, { 
                    start: 0, 
                    end: char.frames - 1 
                }),
                frameRate: 6,
                repeat: -1
            });
        });
    }
}
