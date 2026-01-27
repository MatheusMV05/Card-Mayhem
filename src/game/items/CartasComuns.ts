import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Pedra de Amolar - Aumenta o dano do próximo ataque base em +3
 */
export class PedraDeAmolar implements IItem {
    nome = 'Pedra de Amolar';
    descricao = 'Aumenta o dano do próximo ataque base em +3.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.adicionarModificadorDano({
            multiplicador: 1.2, // ~+3 para ataque de 15
            duracao: 1
        });
        return `${usuario.nome} afiou sua arma! Próximo ataque terá +3 de dano.`;
    }
}

/**
 * Erva Amarga - Remove efeitos de status negativos
 */
export class ErvaAmarga implements IItem {
    nome = 'Erva Amarga';
    descricao = 'Remove efeitos de status negativos (veneno/queimadura).';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        // Limpar efeitos persistentes
        while (usuario.efeitosPersistentes.length > 0) {
            usuario.efeitosPersistentes.pop();
        }
        return `${usuario.nome} consumiu Erva Amarga e removeu todos os efeitos negativos!`;
    }
}

/**
 * Pergaminho de Visão - Revela a raridade da próxima carta do adversário
 */
export class PergaminhoDeVisao implements IItem {
    nome = 'Pergaminho de Visão';
    descricao = 'Revela a raridade da próxima carta do adversário.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        // Efeito visual - implementado na UI
        if (alvo) {
            return `${usuario.nome} usou Pergaminho de Visão! A próxima carta de ${alvo.nome} será revelada.`;
        }
        return `${usuario.nome} usou Pergaminho de Visão!`;
    }
}

/**
 * Bandagem Simples - Cura 5 de HP e estanca sangramentos
 */
export class BandagemSimples implements IItem {
    nome = 'Bandagem Simples';
    descricao = 'Cura 5 de HP e estanca sangramentos.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.curar(5);
        return `${usuario.nome} aplicou Bandagem Simples e recuperou 5 HP!`;
    }
}

/**
 * Amuleto de Barro - Reduz o próximo dano recebido em 3
 */
export class AmuletoDebarro implements IItem {
    nome = 'Amuleto de Barro';
    descricao = 'Reduz o próximo dano recebido em 3.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.adicionarEscudo({
            reducao: 0.15, // ~3 pontos para dano de 20
            duracao: 1
        });
        return `${usuario.nome} ativou Amuleto de Barro! Próximo dano reduzido em 3.`;
    }
}

/**
 * Frasco de Óleo - Aumenta a chance de crítico no próximo turno
 */
export class FrascoDeOleo implements IItem {
    nome = 'Frasco de Óleo';
    descricao = 'Aumenta a chance de crítico no próximo turno.';
    raridade = Raridade.Comum;
    isMayhem = false;

    usar(usuario: Personagem): string {
        // Simula com modificador de dano
        usuario.adicionarModificadorDano({
            multiplicador: 1.3,
            duracao: 1
        });
        return `${usuario.nome} aplicou Frasco de Óleo! Chance de crítico aumentada.`;
    }
}
