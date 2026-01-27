import { IItem, IEfeitoPersistente } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Efeito do Grimório de Lich - Lacaio que ataca automaticamente
 */
class EfeitoLacaio implements IEfeitoPersistente {
    nome = 'Lacaio do Lich';
    duracao: number;
    private alvo: Personagem;

    constructor(duracao: number, alvo: Personagem) {
        this.duracao = duracao;
        this.alvo = alvo;
    }

    aplicar(_personagem: Personagem): string {
        this.alvo.receberDanoDireto(10);
        return `O Lacaio do Lich atacou ${this.alvo.nome} causando 10 de dano!`;
    }
}

/**
 * Cálice do Infinito - Cura todo o seu HP, mas reduz seu dano pela metade
 */
export class CáliceDoInfinito implements IItem {
    nome = 'Cálice do Infinito';
    descricao = 'Cura todo o seu HP, mas reduz seu dano pela metade.';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.curar(usuario.vidaMaxima);
        usuario.adicionarModificadorDano({
            multiplicador: 0.5,
            duracao: 999 // Permanente para a batalha
        });
        return `${usuario.nome} bebeu do Cálice do Infinito! HP completo, mas dano reduzido pela metade.`;
    }
}

/**
 * Espada Excalibur - Seu próximo ataque causa 2x o dano base
 */
export class EspadaExcalibur implements IItem {
    nome = 'Espada Excalibur';
    descricao = 'Seu próximo ataque causa 2x o dano base.';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.adicionarModificadorDano({
            multiplicador: 2.0,
            duracao: 1
        });
        return `${usuario.nome} empunhou a Espada Excalibur! Próximo ataque causará 2x dano!`;
    }
}

/**
 * Grimório de Lich - Invoca um lacaio que ataca automaticamente por 3 turnos
 */
export class GrimórioDelich implements IItem {
    nome = 'Grimório de Lich';
    descricao = 'Invoca um lacaio que ataca automaticamente por 3 turnos.';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            usuario.adicionarEfeitoPersistente(new EfeitoLacaio(3, alvo));
            return `${usuario.nome} invocou um Lacaio do Lich! Ele atacará ${alvo.nome} por 3 turnos.`;
        }
        return `${usuario.nome} usou Grimório de Lich, mas não havia alvo!`;
    }
}

/**
 * Olho de Sauron - Permite ver a mão do inimigo e descartar uma carta dele
 */
export class OlhoDeSauron implements IItem {
    nome = 'Olho de Sauron';
    descricao = 'Permite ver a mão do inimigo e descartar uma carta dele.';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo && alvo.inventario.length > 0) {
            // Remove a primeira carta do inventário do inimigo
            const inventario = alvo.inventario;
            if (inventario.length > 0) {
                alvo.limparInventario();
                // Adiciona de volta todas menos a primeira
                for (let i = 1; i < inventario.length; i++) {
                    alvo.adicionarItem(inventario[i]);
                }
                return `${usuario.nome} usou Olho de Sauron! Uma carta de ${alvo.nome} foi descartada.`;
            }
        }
        return `${usuario.nome} usou Olho de Sauron, mas ${alvo?.nome || 'o alvo'} não tinha cartas!`;
    }
}

/**
 * Capa de Invisibilidade - Você fica invulnerável por 2 turnos (não pode atacar)
 */
export class CapaDeInvisibilidade implements IItem {
    nome = 'Capa de Invisibilidade';
    descricao = 'Você fica invulnerável por 2 turnos (não pode atacar).';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem): string {
        usuario.setInvulnerabilidade(2);
        usuario.setNaoPodeAtacar(2);
        return `${usuario.nome} vestiu a Capa de Invisibilidade! Invulnerável por 2 turnos, mas não pode atacar.`;
    }
}

/**
 * Martelo de Thor - Causa dano massivo e atordoa (pula o turno do inimigo)
 */
export class MarteloDeThor implements IItem {
    nome = 'Martelo de Thor';
    descricao = 'Causa dano massivo e atordoa (pula o turno do inimigo).';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            const dano = 40;
            alvo.receberDano(dano);
            alvo.setAtordoado(true);
            return `${usuario.nome} arremessou o Martelo de Thor! ${alvo.nome} sofreu ${dano} de dano e está atordoado!`;
        }
        return `${usuario.nome} usou Martelo de Thor, mas não havia alvo!`;
    }
}

/**
 * Pedra Filosofal - Transforma uma carta comum em uma Mayhem aleatória
 */
export class PedraFilosofal implements IItem {
    nome = 'Pedra Filosofal';
    descricao = 'Transforma uma carta comum em uma Mayhem aleatória.';
    raridade = Raridade.Lendario;
    isMayhem = false;

    usar(usuario: Personagem): string {
        // Efeito implementado na lógica de batalha
        return `${usuario.nome} usou a Pedra Filosofal! Uma carta comum será transformada em Mayhem.`;
    }
}
