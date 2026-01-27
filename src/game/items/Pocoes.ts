import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Poção de Vida - Cura 10 de HP instantaneamente
 */
export class PocaoVida implements IItem {
    nome = 'Poção de Vida';
    descricao = 'Cura 10 de HP instantaneamente.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.curar(10);
        return `${usuario.nome} usou Poção de Vida e recuperou 10 HP!`;
    }
}

/**
 * Poção de Mana - Recupera 20 de mana instantaneamente
 */
export class PocaoMana implements IItem {
    nome = 'Poção de Mana';
    descricao = 'Recupera 20 de mana instantaneamente.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.recuperarMana(20);
        return `${usuario.nome} usou Poção de Mana e recuperou 20 de mana!`;
    }
}
