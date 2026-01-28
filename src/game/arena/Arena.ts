import { Personagem, PersonagemEstado } from '../entities/Personagem';
import { LutadorNaoEncontradoError, PersonagemMortoError } from '../errors';
import { CardFactory } from '../items';
import { MoedaDoApocalipse, InversaoTemporal } from '../items/CartasMayhem';
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
 * Resultado de uma ação na arena
 */
export interface ResultadoAcao {
    mensagem: string;
    dano: number;
    tipo: 'dano' | 'buff' | 'cura' | 'neutro';
}

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
     * Inicia um novo turno (chamado antes de cada jogador agir)
     * O turno só incrementa quando o jogador1 vai jogar (início de um turno completo)
     */
    iniciarTurno(): string[] {
        if (!this._batalhaAtiva || !this._jogador1 || !this._jogador2) {
            return ['Batalha não está ativa!'];
        }

        // Incrementar turno apenas quando é a vez do jogador1 (início de turno completo)
        if (this._turnoJogador1) {
            this._turnoAtual++;
            // Salvar estado para Inversão Temporal
            this.salvarEstado();
        }

        const jogador = this.jogadorAtual!;
        const mensagens = jogador.iniciarTurno();

        // Verificar se o personagem estava atordoado (mensagem contém "atordoado")
        // O atordoamento é limpo dentro de iniciarTurno(), então verificamos pela mensagem
        const foiAtordoado = mensagens.some(msg => msg.includes('atordoado'));
        if (foiAtordoado) {
            this.finalizarTurno();
            return mensagens;
        }

        // Distribuir novas cartas se necessário
        if (jogador.inventario.length < 4) {
            const cartasFaltando = 4 - jogador.inventario.length;
            const novasCartas = CardFactory.criarCartas(cartasFaltando, this._turnoAtual);
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
     * Determina o tipo de ação baseado no dano e na mensagem
     */
    private determinarTipoAcao(dano: number, mensagem: string): 'dano' | 'buff' | 'cura' | 'neutro' {
        if (dano > 0) {
            return 'dano';
        }
        const mensagemLower = mensagem.toLowerCase();
        if (mensagemLower.includes('cura') || mensagemLower.includes('curou') || 
            mensagemLower.includes('recuperou') || mensagemLower.includes('ganhou') && mensagemLower.includes('hp')) {
            return 'cura';
        }
        if (mensagemLower.includes('escudo') || mensagemLower.includes('proteção') ||
            mensagemLower.includes('imune') || mensagemLower.includes('invocou') ||
            mensagemLower.includes('ativou') || mensagemLower.includes('buff') ||
            mensagemLower.includes('divino') || mensagemLower.includes('modificador')) {
            return 'buff';
        }
        return 'neutro';
    }

    /**
     * Executa um ataque básico (ataque1 ou ataque2)
     */
    executarAtaque(numeroAtaque: 1 | 2): ResultadoAcao {
        if (!this._batalhaAtiva) {
            return { mensagem: 'Batalha não está ativa!', dano: 0, tipo: 'neutro' };
        }

        const atacante = this.jogadorAtual!;
        const alvo = this.oponente!;

        try {
            if (!atacante.estaVivo()) {
                throw new PersonagemMortoError(atacante.nome);
            }
            if (!atacante.podeAtacar()) {
                return { mensagem: `${atacante.nome} não pode atacar neste momento!`, dano: 0, tipo: 'neutro' };
            }

            const resultado = numeroAtaque === 1 
                ? atacante.ataque1(alvo) 
                : atacante.ataque2(alvo);

            this.registrarLog(resultado.mensagem);
            this.verificarFimBatalha();
            
            if (this._batalhaAtiva) {
                this.finalizarTurno();
            }

            const tipo = this.determinarTipoAcao(resultado.dano, resultado.mensagem);
            return { mensagem: resultado.mensagem, dano: resultado.dano, tipo };
        } catch (error) {
            if (error instanceof Error) {
                return { mensagem: error.message, dano: 0, tipo: 'neutro' };
            }
            return { mensagem: 'Erro desconhecido durante o ataque!', dano: 0, tipo: 'neutro' };
        }
    }

    /**
     * Usa uma carta do inventário
     */
    usarCarta(indiceCarta: number): ResultadoAcao {
        if (!this._batalhaAtiva) {
            return { mensagem: 'Batalha não está ativa!', dano: 0, tipo: 'neutro' };
        }

        const usuario = this.jogadorAtual!;
        const alvo = this.oponente!;
        
        // Verificar qual carta será usada para efeitos especiais
        const carta = usuario.inventario[indiceCarta];

        try {
            const resultado = usuario.usarItem(indiceCarta, alvo);
            this.registrarLog(resultado);
            
            // Processar efeitos especiais de cartas Mayhem
            this.processarEfeitosMayhem(carta);
            
            this.verificarFimBatalha();
            
            if (this._batalhaAtiva) {
                this.finalizarTurno();
            }

            // Cartas geralmente não causam dano direto, determinamos o tipo pela mensagem
            const tipo = this.determinarTipoAcao(0, resultado);
            return { mensagem: resultado, dano: 0, tipo };
        } catch (error) {
            if (error instanceof Error) {
                return { mensagem: error.message, dano: 0, tipo: 'neutro' };
            }
            return { mensagem: 'Erro desconhecido ao usar carta!', dano: 0, tipo: 'neutro' };
        }
    }
    
    /**
     * Processa efeitos especiais de cartas Mayhem após uso
     */
    private processarEfeitosMayhem(carta: IItem): void {
        if (!carta.isMayhem) return;
        
        // Moeda do Apocalipse - inverter turno baseado no resultado
        if (carta.nome === 'Moeda do Apocalipse' && MoedaDoApocalipse.ultimoResultado) {
            const resultado = MoedaDoApocalipse.ultimoResultado;
            // Se usuário ganhou a moeda, ele joga de novo (não finalizar turno)
            if (resultado.usuarioGanhou) {
                // Reverter a finalização de turno que será feita depois
                // Fazemos isso invertendo o turno agora para compensar
                this._turnoJogador1 = !this._turnoJogador1;
            }
            MoedaDoApocalipse.ultimoResultado = null;
        }
        
        // Inversão Temporal - reverter estado do jogo
        if (carta.nome === 'Inversão Temporal' && InversaoTemporal.foiUsada) {
            this.inverterTempo(3);
            InversaoTemporal.foiUsada = false;
        }
        
        // Pedra Filosofal - transformar carta comum em Mayhem
        if (carta.nome === 'Pedra Filosofal') {
            const usuario = this.jogadorAtual!;
            const inventario = usuario.inventario;
            
            // Procurar primeira carta Comum/Incomum para transformar
            for (let i = 0; i < inventario.length; i++) {
                const c = inventario[i];
                if (c.raridade === 'Comum' || c.raridade === 'Incomum') {
                    // Remover carta antiga e adicionar Mayhem
                    const novasMayhem = [CardFactory.criarCartaMayhem()];
                    usuario.limparInventario();
                    
                    // Re-adicionar todas exceto a transformada
                    for (let j = 0; j < inventario.length; j++) {
                        if (j === i) {
                            try { usuario.adicionarItem(novasMayhem[0]); } catch { /* */ }
                        } else {
                            try { usuario.adicionarItem(inventario[j]); } catch { /* */ }
                        }
                    }
                    break;
                }
            }
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
            resultados.push(resultado.mensagem);
        }

        if (this._vencedor) {
            resultados.push(`\n=== VENCEDOR: ${this._vencedor.nome} ===`);
        }

        return resultados;
    }
}
