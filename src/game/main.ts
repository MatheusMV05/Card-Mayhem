import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { CharacterSelect } from './scenes/CharacterSelect';
import { Battle } from './scenes/Battle';

// Configuração do jogo


const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    pixelArt: true,          // Renderização crisp para pixel art (sem blur)
    roundPixels: true,       // Arredonda pixels para evitar artefatos
    antialias: false,       
    scale: {
        mode: Phaser.Scale.FIT,           // Mantém proporção e ajusta ao container
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
        max: {
            width: 1920,
            height: 1080
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        CharacterSelect,
        Battle,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
