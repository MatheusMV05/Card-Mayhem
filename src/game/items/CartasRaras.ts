import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';
import { CardFactory } from './CardFactory';

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
 * Orbe de Cristal - Troca a pior carta do inventário por uma nova aleatória
 */
export class OrbeDeCristal implements IItem {
    nome = 'Orbe de Cristal';
    descricao = 'Troca sua pior carta por uma nova aleatória.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        const inventario = usuario.inventario;
        if (inventario.length === 0) {
            return `${usuario.nome} usou Orbe de Cristal, mas não tinha cartas para trocar!`;
        }
        
        // Encontra a carta de menor raridade para trocar
        const ordemRaridade: Record<string, number> = {
            'Comum': 1,
            'Incomum': 2,
            'Raro': 3,
            'Épico': 4,
            'Lendário': 5,
            'Mayhem': 6,
            'Super Mayhem': 7
        };
        
        let piorIndice = 0;
        let piorValor = 999;
        
        for (let i = 0; i < inventario.length; i++) {
            const valor = ordemRaridade[inventario[i].raridade] || 1;
            if (valor < piorValor) {
                piorValor = valor;
                piorIndice = i;
            }
        }
        
        const cartaRemovida = inventario[piorIndice];
        
        // Remover e adicionar nova carta
        usuario.limparInventario();
        for (let i = 0; i < inventario.length; i++) {
            if (i === piorIndice) {
                try {
                    usuario.adicionarItem(CardFactory.criarCartaAleatoria());
                } catch { /* */ }
            } else {
                try {
                    usuario.adicionarItem(inventario[i]);
                } catch { /* */ }
            }
        }
        
        return `${usuario.nome} usou Orbe de Cristal! Trocou ${cartaRemovida.nome} por uma nova carta!`;
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
 * Escudo Espinhoso - Ativa espinhos que causam 5 de dano quando atacado
 */
export class EscudoEspinhoso implements IItem {
    nome = 'Escudo Espinhoso';
    descricao = 'Ativa espinhos que causam 5 de dano ao atacante.';
    raridade = Raridade.Raro;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setCoroaEspinhos(true);
        return `${usuario.nome} ativou Escudo Espinhoso! Causará 5 de dano a quem atacá-lo.`;
    }
}
