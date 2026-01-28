import { Personagem, ResultadoAtaque } from './Personagem';
import { ClassePersonagem } from '../enums';
import { PersonagemMortoError } from '../errors';

/**
 * Classe Guerreiro - Foco em alta durabilidade e força bruta constante
 * 
 * Vida: 150 (A maior do jogo)
 * Mana: 0 (Não utiliza mana)
 * Ataque Base: 18
 */
export class Guerreiro extends Personagem {
    private _golpeBrutalDisponivel: boolean = true;
    private _usouGolpeBrutalUltimoTurno: boolean = false;

    constructor(nome: string) {
        super(
            nome,
            ClassePersonagem.Guerreiro,
            150,  // vidaMaxima
            0,    // manaMaxima (não usa mana)
            18,   // ataque
            15    // defesa
        );
    }

    get nomeAtaque1(): string {
        return 'Golpe Padrão';
    }

    get nomeAtaque2(): string {
        return 'Golpe Brutal';
    }

    get descricaoAtaque1(): string {
        return 'Causa 18 de dano físico direto.';
    }

    get descricaoAtaque2(): string {
        return 'Causa o dobro de dano (36). Não pode ser usado em turnos seguidos.';
    }

    get custoManaAtaque2(): number {
        return 0;
    }

    get golpeBrutalDisponivel(): boolean {
        return this._golpeBrutalDisponivel;
    }

    /**
     * Golpe Padrão - Causa 18 de dano físico direto
     */
    ataque1(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        const dano = 18;
        alvo.receberDano(dano);

        return {
            dano,
            mensagem: `${this.nome} usou Golpe Padrão em ${alvo.nome} causando ${dano} de dano!`
        };
    }

    /**
     * Golpe Brutal - Causa o dobro de dano (36)
     * Não pode ser usado em turnos seguidos
     */
    ataque2(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        if (!this._golpeBrutalDisponivel) {
            return {
                dano: 0,
                mensagem: `${this.nome} ainda está exausto do último Golpe Brutal!`,
                bloqueado: true
            };
        }

        const dano = 36;
        alvo.receberDano(dano);

        this._golpeBrutalDisponivel = false;
        this._usouGolpeBrutalUltimoTurno = true;

        return {
            dano,
            mensagem: `${this.nome} usou Golpe Brutal em ${alvo.nome} causando ${dano} de dano massivo!`
        };
    }

    iniciarTurno(): string[] {
        const mensagens = super.iniciarTurno();
        
        // Resetar disponibilidade do Golpe Brutal após um turno
        if (this._usouGolpeBrutalUltimoTurno) {
            this._golpeBrutalDisponivel = true;
            this._usouGolpeBrutalUltimoTurno = false;
        }

        return mensagens;
    }

    resetar(): void {
        super.resetar();
        this._golpeBrutalDisponivel = true;
        this._usouGolpeBrutalUltimoTurno = false;
    }
}
