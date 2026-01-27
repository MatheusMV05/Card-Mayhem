import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Elixir de Ferro - Imunidade a ataques base por 1 turno
 */
export class ElixirDeFerro implements IItem {
    nome = 'Elixir de Ferro';
    descricao = 'Imunidade a ataques base por 1 turno.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setImunidadeAtaqueBase(1);
        return `${usuario.nome} bebeu Elixir de Ferro! Imune a ataques base por 1 turno.`;
    }
}

/**
 * Cajado Quebrado - O próximo ataque base do inimigo falha
 */
export class CajadoQuebrado implements IItem {
    nome = 'Cajado Quebrado';
    descricao = 'O próximo ataque base do inimigo falha.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            alvo.setProximoAtaqueFalha(true);
            return `${usuario.nome} usou Cajado Quebrado! O próximo ataque de ${alvo.nome} falhará.`;
        }
        return `${usuario.nome} usou Cajado Quebrado, mas não havia alvo!`;
    }
}

/**
 * Manto de Sombras - Esquiva garantida contra a próxima carta de dano
 */
export class MantoDeSombras implements IItem {
    nome = 'Manto de Sombras';
    descricao = 'Esquiva garantida contra a próxima carta de dano.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setEsquivaGarantida(true);
        return `${usuario.nome} vestiu Manto de Sombras! Esquiva garantida contra próxima carta de dano.`;
    }
}

/**
 * Orbe de Cristal - Permite trocar uma das cartas do inventário agora
 */
export class OrbeDeCristal implements IItem {
    nome = 'Orbe de Cristal';
    descricao = 'Permite trocar uma das cartas do inventário agora.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        // Efeito implementado na lógica de batalha
        return `${usuario.nome} usou Orbe de Cristal! Uma carta do inventário pode ser trocada.`;
    }
}

/**
 * Essência de Sangue - Transfere 5 de HP do inimigo para você
 */
export class EssenciaDeSangue implements IItem {
    nome = 'Essência de Sangue';
    descricao = 'Transfere 5 de HP do inimigo para você.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            alvo.receberDanoDireto(5);
            usuario.curar(5);
            return `${usuario.nome} drenou 5 HP de ${alvo.nome} com Essência de Sangue!`;
        }
        return `${usuario.nome} usou Essência de Sangue, mas não havia alvo!`;
    }
}

/**
 * Escudo Espinhoso - Devolve 30% do dano recebido no turno
 */
export class EscudoEspinhoso implements IItem {
    nome = 'Escudo Espinhoso';
    descricao = 'Devolve 30% do dano recebido no turno.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setCoroaEspinhos(true);
        return `${usuario.nome} ativou Escudo Espinhoso! Devolverá 30% do dano recebido.`;
    }
}
