import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError, ManaInsuficienteError } from '../errors';

/**
 * Classe Mago - Foco em alto dano explosivo (Glass Cannon)
 * 
 * Vida: 80 (A menor do jogo, muito vulnerável)
 * Mana: 100
 * Ataque Base: 18 (usado para cálculo da Bola de Fogo)
 */
export class Mago extends Personagem {
    private static readonly CUSTO_BOLA_FOGO = 45;
    private static readonly RECUPERACAO_MEDITAR = 25;

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Mago,
            80,   // vidaMaxima
            100,  // manaMaxima
            18,   // ataque base
            5     // defesa (baixa)
        );
    }

    get nomeAtaque1(): string {
        return 'Meditar';
    }

    get nomeAtaque2(): string {
        return 'Bola de Fogo';
    }

    get descricaoAtaque1(): string {
        return 'Recupera 25 de mana. Não causa dano.';
    }

    get descricaoAtaque2(): string {
        return `Custa ${Mago.CUSTO_BOLA_FOGO} de mana. Causa dano triplo (27).`;
    }

    get custoManaAtaque2(): number {
        return Mago.CUSTO_BOLA_FOGO;
    }

    /**
     * Meditar - Recupera 25 de mana
     */
    ataque1(_alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }

        this.recuperarMana(Mago.RECUPERACAO_MEDITAR);

        return {
            dano: 0,
            mensagem: `${this.nome} meditou e recuperou ${Mago.RECUPERACAO_MEDITAR} de mana! (Mana: ${this.mana}/${this.manaMaxima})`
        };
    }

    /**
     * Bola de Fogo - Custa 30 de mana, causa dano triplo (54)
     */
    ataque2(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        if (this.mana < Mago.CUSTO_BOLA_FOGO) {
            throw new ManaInsuficienteError(this.nome, Mago.CUSTO_BOLA_FOGO, this.mana);
        }

        this.consumirMana(Mago.CUSTO_BOLA_FOGO);
        const dano = this.ataque * 1.5; // 27 de dano

        alvo.receberDano(dano);

        return {
            dano,
            mensagem: `${this.nome} lançou Bola de Fogo em ${alvo.nome} causando ${dano} de dano mágico!`
        };
    }
}
