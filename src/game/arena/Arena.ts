import { Personagem, PersonagemEstado } from '../entities/Personagem';
import { LutadorNaoEncontradoError, PersonagemMortoError } from '../errors';
import { CardFactory } from '../items';
import { IItem } from '../interfaces';

/**
 * Interface para log de batalha
 */
export interface LogBatalha {
    turno: number;
    acao: string;
    vidaJogador1: number;
    vidaJogador2: number;
    manaJogador1: number;
    manaJogador2: number;
}

/**
 * Estado do jogo para Inversão Temporal
 */
interface EstadoJogo {
    turno: number;
    jogador1Estado: PersonagemEstado;
    jogador2Estado: PersonagemEstado;
    inventarioJogador1: IItem[];
    inventarioJogador2: IItem[];
}

/**
 * Callback para eventos de batalha
 */
export type BatalhaCallback = (log: LogBatalha) => void;

/**
 * Classe Arena - Gerencia lutadores e batalhas
 */
export class Arena {
    private lutadores: Personagem[] = [];
    private _jogador1: Personagem | null = null;
    private _jogador2: Personagem | null = null;
    private _turnoAtual: number = 0;
    private _turnoJogador1: boolean = true;
    private _batalhaAtiva: boolean = false;
    private _logs: LogBatalha[] = [];
    private _historico: EstadoJogo[] = [];
    private _vencedor: Personagem | null = null;
    private _onLog: BatalhaCallback | null = null;

    constructor() {}

    // Getters
    get jogador1(): Personagem | null {
        return this._jogador1;
    }

    get jogador2(): Personagem | null {
        return this._jogador2;
    }

    get turnoAtual(): number {
        return this._turnoAtual;
    }

    get turnoJogador1(): boolean {
        return this._turnoJogador1;
    }

    get batalhaAtiva(): boolean {
        return this._batalhaAtiva;
    }

    get logs(): LogBatalha[] {
        return [...this._logs];
    }

    get vencedor(): Personagem | null {
        return this._vencedor;
    }

    get jogadorAtual(): Personagem | null {
        return this._turnoJogador1 ? this._jogador1 : this._jogador2;
    }

    get oponente(): Personagem | null {
        return this._turnoJogador1 ? this._jogador2 : this._jogador1;
    }

    /**
     * Define callback para logs de batalha
     */
    setOnLog(callback: BatalhaCallback): void {
        this._onLog = callback;
    }

    /**
     * Adiciona um lutador à arena
     */
    adicionarLutador(lutador: Personagem): void {
        this.lutadores.push(lutador);
    }

    /**
     * Lista todos os lutadores da arena
     */
    listarLutadores(): Personagem[] {
        return [...this.lutadores];
    }

    /**
     * Busca um lutador pelo nome
     */
    buscarLutador(nome: string): Personagem {
        const lutador = this.lutadores.find(l => l.nome.toLowerCase() === nome.toLowerCase());
        if (!lutador) {
            throw new LutadorNaoEncontradoError(nome);
        }
        return lutador;
    }

    /**
     * Inicia uma batalha entre dois personagens
     */
    iniciarBatalha(jogador1: Personagem, jogador2: Personagem): void {
        // Resetar personagens
        jogador1.resetar();
        jogador2.resetar();

        this._jogador1 = jogador1;
        this._jogador2 = jogador2;
        this._turnoAtual = 0;
        this._turnoJogador1 = true;
        this._batalhaAtiva = true;
        this._logs = [];
        this._historico = [];
        this._vencedor = null;

        // Distribuir cartas iniciais
        this.distribuirCartas(jogador1);
        this.distribuirCartas(jogador2);

        this.registrarLog('Batalha iniciada!');
    }

    /**
     * Distribui cartas para um jogador
     */
    private distribuirCartas(jogador: Personagem): void {
        jogador.limparInventario();
        const cartas = CardFactory.criarCartas(4);
        for (const carta of cartas) {
            try {
                jogador.adicionarItem(carta);
            } catch {
                // Inventário cheio
                break;
            }
        }
    }

    /**
     * Inicia um novo turno
     */
    iniciarTurno(): string[] {
        if (!this._batalhaAtiva || !this._jogador1 || !this._jogador2) {
            return ['Batalha não está ativa!'];
        }

        this._turnoAtual++;
        
        // Salvar estado para Inversão Temporal
        this.salvarEstado();

        const jogador = this.jogadorAtual!;
        const mensagens = jogador.iniciarTurno();

        // Verificar atordoamento
        if (jogador.estaAtordoado()) {
            this.finalizarTurno();
            return [`${jogador.nome} está atordoado e perdeu o turno!`];
        }

        // Distribuir novas cartas se necessário
        if (jogador.inventario.length < 4) {
            const cartasFaltando = 4 - jogador.inventario.length;
            const novasCartas = CardFactory.criarCartas(cartasFaltando);
            for (const carta of novasCartas) {
                try {
                    jogador.adicionarItem(carta);
                } catch {
                    break;
                }
            }
        }

        return mensagens;
    }

    /**
     * Executa um ataque básico (ataque1 ou ataque2)
     */
    executarAtaque(numeroAtaque: 1 | 2): string {
        if (!this._batalhaAtiva) {
            return 'Batalha não está ativa!';
        }

        const atacante = this.jogadorAtual!;
        const alvo = this.oponente!;

        try {
            if (!atacante.estaVivo()) {
                throw new PersonagemMortoError(atacante.nome);
            }
            if (!atacante.podeAtacar()) {
                return `${atacante.nome} não pode atacar neste momento!`;
            }

            const resultado = numeroAtaque === 1 
                ? atacante.ataque1(alvo) 
                : atacante.ataque2(alvo);

            this.registrarLog(resultado.mensagem);
            this.verificarFimBatalha();
            
            if (this._batalhaAtiva) {
                this.finalizarTurno();
            }

            return resultado.mensagem;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return 'Erro desconhecido durante o ataque!';
        }
    }

    /**
     * Usa uma carta do inventário
     */
    usarCarta(indiceCarta: number): string {
        if (!this._batalhaAtiva) {
            return 'Batalha não está ativa!';
        }

        const usuario = this.jogadorAtual!;
        const alvo = this.oponente!;

        try {
            const resultado = usuario.usarItem(indiceCarta, alvo);
            this.registrarLog(resultado);
            this.verificarFimBatalha();
            
            if (this._batalhaAtiva) {
                this.finalizarTurno();
            }

            return resultado;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return 'Erro desconhecido ao usar carta!';
        }
    }

    /**
     * Finaliza o turno atual
     */
    private finalizarTurno(): void {
        this._turnoJogador1 = !this._turnoJogador1;
    }

    /**
     * Verifica se a batalha terminou
     */
    private verificarFimBatalha(): void {
        if (!this._jogador1 || !this._jogador2) return;

        if (!this._jogador1.estaVivo()) {
            this._vencedor = this._jogador2;
            this._batalhaAtiva = false;
            this.registrarLog(`${this._jogador2.nome} venceu a batalha!`);
        } else if (!this._jogador2.estaVivo()) {
            this._vencedor = this._jogador1;
            this._batalhaAtiva = false;
            this.registrarLog(`${this._jogador1.nome} venceu a batalha!`);
        }
    }

    /**
     * Salva o estado atual do jogo (para Inversão Temporal)
     */
    private salvarEstado(): void {
        if (!this._jogador1 || !this._jogador2) return;

        const estado: EstadoJogo = {
            turno: this._turnoAtual,
            jogador1Estado: this._jogador1.clonarEstado(),
            jogador2Estado: this._jogador2.clonarEstado(),
            inventarioJogador1: [...this._jogador1.inventario],
            inventarioJogador2: [...this._jogador2.inventario]
        };

        this._historico.push(estado);

        // Manter apenas os últimos 5 estados
        if (this._historico.length > 5) {
            this._historico.shift();
        }
    }

    /**
     * Reverte o jogo para um estado anterior (Inversão Temporal)
     */
    inverterTempo(turnosAtras: number = 3): boolean {
        if (!this._jogador1 || !this._jogador2) return false;

        const indice = Math.max(0, this._historico.length - turnosAtras);
        const estado = this._historico[indice];

        if (!estado) return false;

        this._jogador1.restaurarEstado(estado.jogador1Estado);
        this._jogador2.restaurarEstado(estado.jogador2Estado);
        this._turnoAtual = estado.turno;

        // Limpar histórico após a inversão
        this._historico = this._historico.slice(0, indice);

        this.registrarLog('O tempo foi revertido!');
        return true;
    }

    /**
     * Registra um log de batalha
     */
    private registrarLog(acao: string): void {
        const log: LogBatalha = {
            turno: this._turnoAtual,
            acao,
            vidaJogador1: this._jogador1?.vida || 0,
            vidaJogador2: this._jogador2?.vida || 0,
            manaJogador1: this._jogador1?.mana || 0,
            manaJogador2: this._jogador2?.mana || 0
        };

        this._logs.push(log);

        if (this._onLog) {
            this._onLog(log);
        }
    }

    /**
     * Batalha automática entre dois personagens (para demonstração)
     */
    batalhar(nome1: string, nome2: string): string[] {
        const lutador1 = this.buscarLutador(nome1);
        const lutador2 = this.buscarLutador(nome2);

        this.iniciarBatalha(lutador1, lutador2);

        const resultados: string[] = [];
        resultados.push(`=== BATALHA: ${lutador1.nome} vs ${lutador2.nome} ===`);

        while (this._batalhaAtiva && this._turnoAtual < 100) {
            const mensagensTurno = this.iniciarTurno();
            resultados.push(...mensagensTurno);

            if (!this._batalhaAtiva) break;

            // IA simples: escolhe ataque aleatório
            const ataqueEscolhido = Math.random() < 0.5 ? 1 : 2;
            const resultado = this.executarAtaque(ataqueEscolhido as 1 | 2);
            resultados.push(resultado);
        }

        if (this._vencedor) {
            resultados.push(`\n=== VENCEDOR: ${this._vencedor.nome} ===`);
        }

        return resultados;
    }
}
