import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError, ManaInsuficienteError } from '../errors';

/**
 * Classe Feiticeiro - Especialista em manipulação de dano e combos de mana
 * 
 * Vida: 85
 * Mana: 120
 * Ataque Base: 20
 */
export class Feiticeiro extends Personagem {
    private static readonly CUSTO_FLUXO_MANA = 15;
    private static readonly DANO_DARDO = 20;

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Feiticeiro,
            85,   // vidaMaxima
            120,  // manaMaxima
            20,   // ataque
            6     // defesa
        );
    }

    get nomeAtaque1(): string {
        return 'Dardo Arcano';
    }

    get nomeAtaque2(): string {
        return 'Fluxo de Mana';
    }

    get descricaoAtaque1(): string {
        return 'Causa 20 de dano. Ignora escudos e defesas do alvo.';
    }

    get descricaoAtaque2(): string {
        return `Custa ${Feiticeiro.CUSTO_FLUXO_MANA} de mana. O próximo ataque causa 1.5x de dano.`;
    }

    get custoManaAtaque2(): number {
        return Feiticeiro.CUSTO_FLUXO_MANA;
    }

    /**
     * Dardo Arcano - Causa 20 de dano, ignora defesas e escudos
     */
    ataque1(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        const dano = Feiticeiro.DANO_DARDO;
        
        // Dano direto ignora escudos
        alvo.receberDanoDireto(dano);

        return {
            dano,
            mensagem: `${this.nome} disparou Dardo Arcano em ${alvo.nome} causando ${dano} de dano puro!`
        };
    }

    /**
     * Fluxo de Mana - Custa 15 de mana, próximo ataque causa 1.5x de dano
     */
    ataque2(_alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }

        if (this.mana < Feiticeiro.CUSTO_FLUXO_MANA) {
            throw new ManaInsuficienteError(this.nome, Feiticeiro.CUSTO_FLUXO_MANA, this.mana);
        }

        this.consumirMana(Feiticeiro.CUSTO_FLUXO_MANA);
        
        // Adicionar modificador de dano 1.5x para próximo ataque
        this.adicionarModificadorDano({
            multiplicador: 1.5,
            duracao: 1
        });

        return {
            dano: 0,
            mensagem: `${this.nome} canalizou Fluxo de Mana! O próximo ataque causará 1.5x de dano.`
        };
    }
}
