import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError, ManaInsuficienteError } from '../errors';

/**
 * Classe Arqueiro - Foco em equilíbrio, precisão e ataques críticos
 * 
 * Vida: 100
 * Mana: 50
 * Ataque Base: 15
 */
export class Arqueiro extends Personagem {
    private static readonly CUSTO_FLECHA_PRECISA = 15;
    private static readonly CHANCE_CRITICO = 0.30; // 30%

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Arqueiro,
            100,  // vidaMaxima
            50,   // manaMaxima
            15,   // ataque
            10    // defesa
        );
    }

    get nomeAtaque1(): string {
        return 'Disparo Ágil';
    }

    get nomeAtaque2(): string {
        return 'Flecha Precisa';
    }

    get descricaoAtaque1(): string {
        return 'Causa 15 de dano. 30% de chance de crítico (dano dobrado).';
    }

    get descricaoAtaque2(): string {
        return `Custa ${Arqueiro.CUSTO_FLECHA_PRECISA} de mana. Causa 25 de dano fixo, não pode ser evitado.`;
    }

    get custoManaAtaque2(): number {
        return Arqueiro.CUSTO_FLECHA_PRECISA;
    }

    /**
     * Disparo Ágil - Causa 15 de dano, 30% de chance de crítico
     */
    ataque1(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        const critico = Math.random() < Arqueiro.CHANCE_CRITICO;
        const dano = critico ? 30 : 15;

        alvo.receberDano(dano);

        return {
            dano,
            critico,
            mensagem: critico
                ? `${this.nome} acertou um CRÍTICO com Disparo Ágil em ${alvo.nome} causando ${dano} de dano!`
                : `${this.nome} usou Disparo Ágil em ${alvo.nome} causando ${dano} de dano!`
        };
    }

    /**
     * Flecha Precisa - Custa 15 de mana, causa 25 de dano fixo
     * Não pode ser evitado por cartas de esquiva
     */
    ataque2(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        if (this.mana < Arqueiro.CUSTO_FLECHA_PRECISA) {
            throw new ManaInsuficienteError(this.nome, Arqueiro.CUSTO_FLECHA_PRECISA, this.mana);
        }

        this.consumirMana(Arqueiro.CUSTO_FLECHA_PRECISA);
        const dano = 25;

        // Ignora esquiva garantida
        alvo.receberDanoDireto(dano);

        return {
            dano,
            mensagem: `${this.nome} disparou uma Flecha Precisa em ${alvo.nome} causando ${dano} de dano inevitável!`
        };
    }
}
