import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError } from '../errors';
import { IEfeitoPersistente } from '../interfaces';

/**
 * Efeito de veneno/debilitação do Necromante
 */
class EfeitoDebilitante implements IEfeitoPersistente {
    nome = 'Debilitação';
    duracao: number;
    private danoDoT: number;

    constructor(duracao: number = 2, danoDoT: number = 5) {
        this.duracao = duracao;
        this.danoDoT = danoDoT;
    }

    aplicar(personagem: Personagem): string {
        personagem.receberDanoDireto(this.danoDoT);
        return `${personagem.nome} sofreu ${this.danoDoT} de dano por Debilitação!`;
    }
}

/**
 * Classe Necromante - Foco em alto risco e dano persistente
 * 
 * Vida: 90
 * Mana: 80
 * Ataque Base: 10
 */
export class Necromante extends Personagem {
    private static readonly DANO_TOQUE = 10;
    private static readonly DANO_SACRIFICIO = 35;
    private static readonly CUSTO_HP_SACRIFICIO = 10;

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Necromante,
            90,   // vidaMaxima
            80,   // manaMaxima
            10,   // ataque
            8     // defesa
        );
    }

    get nomeAtaque1(): string {
        return 'Toque Debilitante';
    }

    get nomeAtaque2(): string {
        return 'Sacrifício';
    }

    get descricaoAtaque1(): string {
        return 'Causa 10 de dano. O alvo perde 5 HP por turno durante 2 rodadas.';
    }

    get descricaoAtaque2(): string {
        return `Causa ${Necromante.DANO_SACRIFICIO} de dano. Custo: O Necromante perde ${Necromante.CUSTO_HP_SACRIFICIO} HP.`;
    }

    get custoManaAtaque2(): number {
        return 0; // Custa HP, não mana
    }

    /**
     * Toque Debilitante - Causa dano baixo (10), mas aplica DoT
     */
    ataque1(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        const dano = Necromante.DANO_TOQUE;
        alvo.receberDano(dano);
        
        // Aplicar efeito de debilitação (5 HP por turno durante 2 rodadas)
        alvo.adicionarEfeitoPersistente(new EfeitoDebilitante(2, 5));

        return {
            dano,
            mensagem: `${this.nome} usou Toque Debilitante em ${alvo.nome} causando ${dano} de dano e aplicando Debilitação (5 dano/turno por 2 turnos)!`
        };
    }

    /**
     * Sacrifício - Causa dano alto (35), mas o Necromante perde 10 HP
     */
    ataque2(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        // Pagar custo de HP
        this.receberDanoDireto(Necromante.CUSTO_HP_SACRIFICIO);

        const dano = Necromante.DANO_SACRIFICIO;
        alvo.receberDano(dano);

        return {
            dano,
            mensagem: `${this.nome} usou Sacrifício em ${alvo.nome}, perdendo ${Necromante.CUSTO_HP_SACRIFICIO} HP e causando ${dano} de dano sombrio!`
        };
    }
}
