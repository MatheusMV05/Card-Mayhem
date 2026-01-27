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
        graphics.fillRect(0, 0, 1024, 768);

        // Barra de progresso - contorno
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(2, 0xe94560);

        // Barra de progresso
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xe94560);

        // Texto de loading
        const loadingText = this.add.text(512, 340, 'Carregando...', {
            fontFamily: 'Arial',
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
    }

    create() {
        // Após carregar, ir para o menu principal
        this.scene.start('MainMenu');
    }
}
