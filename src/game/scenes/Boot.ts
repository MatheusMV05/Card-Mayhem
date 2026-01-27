import { Scene } from 'phaser';

/**
 * Boot Scene - Primeira cena do jogo, carrega assets mínimos
 */
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Carregar apenas o necessário para o preloader
        // O fundo será gerado proceduralmente
    }

    create() {
        // Configurar algumas propriedades globais do jogo
        this.game.registry.set('gameTitle', 'Card Mayhem');
        this.game.registry.set('version', '1.0.0');
        
        this.scene.start('Preloader');
    }
}
