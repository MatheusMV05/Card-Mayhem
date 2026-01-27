import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError, ManaInsuficienteError } from '../errors';

/**
 * Classe Paladino - Foco em resistência e sustentação (Cura/Defesa)
 * 
 * Vida: 130
 * Mana: 60
 * Ataque Base: 15
 */
export class Paladino extends Personagem {
    private static readonly CUSTO_ESCUDO_DIVINO = 20;
    private static readonly CURA_GOLPE_FE = 5;

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Paladino,
            130,  // vidaMaxima
            60,   // manaMaxima
            15,   // ataque
            18    // defesa (alta)
        );
    }

    get nomeAtaque1(): string {
        return 'Golpe de Fé';
    }

    get nomeAtaque2(): string {
        return 'Escudo Divino';
    }

    get descricaoAtaque1(): string {
        return 'Causa 15 de dano e cura o Paladino em 5 HP.';
    }

    get descricaoAtaque2(): string {
        return `Custa ${Paladino.CUSTO_ESCUDO_DIVINO} de mana. Reduz o próximo dano recebido em 50%.`;
    }

    get custoManaAtaque2(): number {
        return Paladino.CUSTO_ESCUDO_DIVINO;
    }

    /**
     * Golpe de Fé - Causa dano base (15) e cura o Paladino em 5 HP
     */
    ataque1(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        const dano = this.ataque;
        alvo.receberDano(dano);
        
        this.curar(Paladino.CURA_GOLPE_FE);

        return {
            dano,
            mensagem: `${this.nome} usou Golpe de Fé em ${alvo.nome} causando ${dano} de dano e se curando em ${Paladino.CURA_GOLPE_FE} HP!`
        };
    }

    /**
     * Escudo Divino - Custa 20 de mana, reduz o próximo dano recebido em 50%
     */
    ataque2(_alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }

        if (this.mana < Paladino.CUSTO_ESCUDO_DIVINO) {
            throw new ManaInsuficienteError(this.nome, Paladino.CUSTO_ESCUDO_DIVINO, this.mana);
        }

        this.consumirMana(Paladino.CUSTO_ESCUDO_DIVINO);
        
        // Adicionar escudo de 50% de redução por 1 hit
        this.adicionarEscudo({
            reducao: 0.5,
            duracao: 1
        });

        return {
            dano: 0,
            mensagem: `${this.nome} invocou Escudo Divino! O próximo dano será reduzido em 50%.`
        };
    }
}
