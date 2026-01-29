import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Livro de Feitiços Proibidos - Reduz o HP do oponente pela metade (limitado a 1x por alvo)
 */
export class LivroDeFeiticosProibidos implements IItem {
    nome = 'Livro de Feitiços Proibidos';
    descricao = 'Reduz o HP do oponente pela metade (limitado a 1x por alvo).';
    raridade = Raridade.Epico;
    isMayhem = false;
    private static alvosAfetados: Set<string> = new Set();

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            if (LivroDeFeiticosProibidos.alvosAfetados.has(alvo.nome)) {
                return `O Livro de Feitiços Proibidos já foi usado em ${alvo.nome}!`;
            }
            
            const dano = Math.floor(alvo.vida / 2);
            alvo.receberDanoDireto(dano);
            LivroDeFeiticosProibidos.alvosAfetados.add(alvo.nome);
            
            return `${usuario.nome} usou Livro de Feitiços Proibidos! ${alvo.nome} perdeu metade do HP (${dano})!`;
        }
        return `${usuario.nome} usou Livro de Feitiços Proibidos, mas não havia alvo!`;
    }
    
    static resetar(): void {
        LivroDeFeiticosProibidos.alvosAfetados.clear();
    }
}

/**
 * Relíquia Sagrada - Ressuscita com 20% de HP se morrer no próximo turno
 */
export class ReliquiaSagrada implements IItem {
    nome = 'Relíquia Sagrada';
    descricao = 'Ressuscita com 20% de HP se morrer no próximo turno.';
    raridade = Raridade.Epico;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setReliquiaSagrada(true);
        return `${usuario.nome} ativou Relíquia Sagrada! Ressuscitará com 20% de HP se morrer.`;
    }
}

/**
 * Ankh da Reencarnação - Limpa todas as cartas da mão e compra 3 novas épicas
 */
export class AnkhDaReencarnacao implements IItem {
    nome = 'Ankh da Reencarnação';
    descricao = 'Limpa todas as cartas da mão e compra 3 novas épicas.';
    raridade = Raridade.Epico;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.limparInventario();
        // Novas cartas são adicionadas pela lógica de batalha
        return `${usuario.nome} usou Ankh da Reencarnação! Inventário limpo, 3 cartas épicas serão distribuídas.`;
    }
}

/**
 * Coroa de Espinhos - O inimigo perde 5 de HP toda vez que usar um ataque base
 */
export class CoroaDeEspinhos implements IItem {
    nome = 'Coroa de Espinhos';
    descricao = 'O inimigo perde 5 de HP toda vez que usar um ataque base.';
    raridade = Raridade.Epico;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            // Usa o sistema de Coroa de Espinhos já implementado no Personagem
            alvo.setCoroaEspinhos(true);
            return `${usuario.nome} colocou Coroa de Espinhos em ${alvo.nome}! Perderá 5 HP por ataque base.`;
        }
        return `${usuario.nome} usou Coroa de Espinhos, mas não havia alvo!`;
    }
}

/**
 * Cetro de Dominação - Impede o inimigo de usar cartas por 2 turnos
 */
export class CetroDeDominacao implements IItem {
    nome = 'Cetro de Dominação';
    descricao = 'Impede o inimigo de usar cartas por 2 turnos.';
    raridade = Raridade.Epico;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            alvo.setBloqueioCartas(2);
            return `${usuario.nome} usou Cetro de Dominação! ${alvo.nome} não pode usar cartas por 2 turnos.`;
        }
        return `${usuario.nome} usou Cetro de Dominação, mas não havia alvo!`;
    }
}
