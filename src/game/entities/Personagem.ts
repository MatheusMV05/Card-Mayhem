import { ClassePersonagem } from '../enums';
import { IItem, IEfeitoPersistente, IModificadorDano, IEscudo } from '../interfaces';
import { PersonagemMortoError, InventarioCheioError, AcaoInvalidaError } from '../errors';

/**
 * Resultado de um ataque
 */
export interface ResultadoAtaque {
    dano: number;
    mensagem: string;
    critico?: boolean;
    bloqueado?: boolean;
}

/**
 * Classe base para todos os personagens do jogo
 */
export abstract class Personagem {
    // Atributos privados
    private _vida: number;
    private _vidaMaxima: number;
    private _mana: number;
    private _manaMaxima: number;
    private _inventario: IItem[] = [];
    
    // Atributos para controle de efeitos
    private _efeitosPersistentes: IEfeitoPersistente[] = [];
    private _modificadoresDano: IModificadorDano[] = [];
    private _escudos: IEscudo[] = [];
    private _imunidadeAtaqueBase: number = 0;
    private _bloqueioCartas: number = 0;
    private _invulnerabilidade: number = 0;
    private _naoPodeAtacar: number = 0;
    private _atordoado: boolean = false;
    private _esquivaGarantida: boolean = false;
    private _proximoAtaqueFalha: boolean = false;
    private _reliquiaSagradaAtiva: boolean = false;
    private _coroaEspinhosAtiva: boolean = false;
    
    // Cartas Mayhem usadas na partida
    private _mayhemUsadas: Set<string> = new Set();
    
    // Atributos públicos
    public readonly nome: string;
    public readonly classe: ClassePersonagem;
    public ataque: number;
    public defesa: number;
    
    // Capacidade máxima do inventário
    protected static readonly MAX_INVENTARIO = 4;
    
    // Recuperação de mana por turno
    protected static readonly MANA_RECUPERACAO = 40;

    constructor(
        nome: string,
        classe: ClassePersonagem,
        vidaMaxima: number,
        manaMaxima: number,
        ataque: number,
        defesa: number
    ) {
        this.nome = nome;
        this.classe = classe;
        this._vidaMaxima = vidaMaxima;
        this._vida = vidaMaxima;
        this._manaMaxima = manaMaxima;
        this._mana = manaMaxima;
        this.ataque = ataque;
        this.defesa = defesa;
    }

    // Getters e Setters
    get vida(): number {
        return this._vida;
    }

    set vida(valor: number) {
        if (valor < 0) {
            this._vida = 0;
        } else if (valor > this._vidaMaxima) {
            this._vida = this._vidaMaxima;
        } else {
            this._vida = valor;
        }
    }

    get vidaMaxima(): number {
        return this._vidaMaxima;
    }

    set vidaMaxima(valor: number) {
        this._vidaMaxima = Math.max(1, valor);
        if (this._vida > this._vidaMaxima) {
            this._vida = this._vidaMaxima;
        }
    }

    get mana(): number {
        return this._mana;
    }

    set mana(valor: number) {
        if (valor < 0) {
            this._mana = 0;
        } else if (valor > this._manaMaxima) {
            this._mana = this._manaMaxima;
        } else {
            this._mana = valor;
        }
    }

    get manaMaxima(): number {
        return this._manaMaxima;
    }

    get inventario(): IItem[] {
        return [...this._inventario];
    }

    get efeitosPersistentes(): IEfeitoPersistente[] {
        return [...this._efeitosPersistentes];
    }

    // Métodos de estado
    estaVivo(): boolean {
        return this._vida > 0;
    }

    estaAtordoado(): boolean {
        return this._atordoado;
    }

    podeUsarCartas(): boolean {
        return this._bloqueioCartas <= 0;
    }

    estaInvulneravel(): boolean {
        return this._invulnerabilidade > 0;
    }

    podeAtacar(): boolean {
        return this._naoPodeAtacar <= 0;
    }

    temEsquivaGarantida(): boolean {
        return this._esquivaGarantida;
    }

    proximoAtaqueVaiFalhar(): boolean {
        return this._proximoAtaqueFalha;
    }

    // Verificar se carta Mayhem já foi usada
    mayhemJaUsada(nomeCarta: string): boolean {
        return this._mayhemUsadas.has(nomeCarta);
    }

    registrarMayhemUsada(nomeCarta: string): void {
        this._mayhemUsadas.add(nomeCarta);
    }

    // Métodos de combate
    atacar(alvo: Personagem): ResultadoAtaque {
        if (!this.estaVivo()) {
            throw new PersonagemMortoError(this.nome);
        }
        if (!alvo.estaVivo()) {
            throw new PersonagemMortoError(alvo.nome);
        }

        // Verificar se o próximo ataque falha
        if (alvo._proximoAtaqueFalha) {
            alvo._proximoAtaqueFalha = false;
            return {
                dano: 0,
                mensagem: `${this.nome} atacou, mas o ataque falhou!`,
                bloqueado: true
            };
        }

        // Verificar imunidade a ataques base
        if (alvo._imunidadeAtaqueBase > 0) {
            return {
                dano: 0,
                mensagem: `${alvo.nome} está imune a ataques base!`,
                bloqueado: true
            };
        }

        // Verificar invulnerabilidade
        if (alvo.estaInvulneravel()) {
            return {
                dano: 0,
                mensagem: `${alvo.nome} está invulnerável!`,
                bloqueado: true
            };
        }

        let dano = this.ataque;
        
        // Aplicar modificadores de dano do atacante
        for (const mod of this._modificadoresDano) {
            dano = Math.floor(dano * mod.multiplicador);
        }

        // Aplicar escudos do alvo
        let danoFinal = dano;
        for (const escudo of alvo._escudos) {
            danoFinal = Math.floor(danoFinal * (1 - escudo.reducao));
        }

        // Aplicar dano
        alvo.receberDano(danoFinal);

        // Verificar Coroa de Espinhos
        if (alvo._coroaEspinhosAtiva) {
            this.receberDano(5);
        }

        return {
            dano: danoFinal,
            mensagem: `${this.nome} atacou ${alvo.nome} causando ${danoFinal} de dano!`
        };
    }

    receberDano(quantidade: number): number {
        if (this.estaInvulneravel()) {
            return 0;
        }

        let danoFinal = quantidade;

        // Aplicar escudos
        for (const escudo of this._escudos) {
            danoFinal = Math.floor(danoFinal * (1 - escudo.reducao));
        }

        this.vida -= danoFinal;

        // Verificar Relíquia Sagrada
        if (!this.estaVivo() && this._reliquiaSagradaAtiva) {
            this._reliquiaSagradaAtiva = false;
            this.vida = Math.floor(this._vidaMaxima * 0.2);
        }

        return danoFinal;
    }

    receberDanoDireto(quantidade: number): number {
        // Ignora escudos e defesas
        if (this.estaInvulneravel()) {
            return 0;
        }
        
        this.vida -= quantidade;
        
        if (!this.estaVivo() && this._reliquiaSagradaAtiva) {
            this._reliquiaSagradaAtiva = false;
            this.vida = Math.floor(this._vidaMaxima * 0.2);
        }
        
        return quantidade;
    }

    curar(quantidade: number): void {
        this.vida += quantidade;
    }

    recuperarMana(quantidade: number): void {
        this.mana += quantidade;
    }

    consumirMana(quantidade: number): boolean {
        if (this._mana >= quantidade) {
            this._mana -= quantidade;
            return true;
        }
        return false;
    }

    // Métodos de inventário
    adicionarItem(item: IItem): void {
        if (this._inventario.length >= Personagem.MAX_INVENTARIO) {
            throw new InventarioCheioError(this.nome);
        }
        this._inventario.push(item);
    }

    usarItem(indice: number, alvo?: Personagem): string {
        if (indice < 0 || indice >= this._inventario.length) {
            throw new AcaoInvalidaError(`Índice de item inválido: ${indice}`);
        }

        if (!this.podeUsarCartas()) {
            throw new AcaoInvalidaError(`${this.nome} não pode usar cartas neste momento!`);
        }

        const item = this._inventario[indice];
        
        // Verificar se é Mayhem e já foi usada
        if (item.isMayhem && this.mayhemJaUsada(item.nome)) {
            throw new AcaoInvalidaError(`A carta Mayhem "${item.nome}" já foi usada nesta partida!`);
        }

        const resultado = item.usar(this, alvo);
        
        // Registrar uso de Mayhem
        if (item.isMayhem) {
            this.registrarMayhemUsada(item.nome);
        }

        // Remover item do inventário
        this._inventario.splice(indice, 1);

        return resultado;
    }

    limparInventario(): void {
        this._inventario = [];
    }

    // Métodos de efeitos
    adicionarEfeitoPersistente(efeito: IEfeitoPersistente): void {
        this._efeitosPersistentes.push(efeito);
    }

    adicionarModificadorDano(modificador: IModificadorDano): void {
        this._modificadoresDano.push(modificador);
    }

    adicionarEscudo(escudo: IEscudo): void {
        this._escudos.push(escudo);
    }

    setImunidadeAtaqueBase(turnos: number): void {
        this._imunidadeAtaqueBase = turnos;
    }

    setBloqueioCartas(turnos: number): void {
        this._bloqueioCartas = turnos;
    }

    setInvulnerabilidade(turnos: number): void {
        this._invulnerabilidade = turnos;
    }

    setNaoPodeAtacar(turnos: number): void {
        this._naoPodeAtacar = turnos;
    }

    setAtordoado(valor: boolean): void {
        this._atordoado = valor;
    }

    setEsquivaGarantida(valor: boolean): void {
        this._esquivaGarantida = valor;
    }

    setProximoAtaqueFalha(valor: boolean): void {
        this._proximoAtaqueFalha = valor;
    }

    setReliquiaSagrada(valor: boolean): void {
        this._reliquiaSagradaAtiva = valor;
    }

    setCoroaEspinhos(valor: boolean): void {
        this._coroaEspinhosAtiva = valor;
    }

    // Processar início do turno
    iniciarTurno(): string[] {
        const mensagens: string[] = [];

        // Verificar atordoamento
        if (this._atordoado) {
            this._atordoado = false;
            mensagens.push(`${this.nome} estava atordoado e perdeu o turno!`);
            return mensagens;
        }

        // Aplicar efeitos persistentes
        const efeitosAtivos: IEfeitoPersistente[] = [];
        for (const efeito of this._efeitosPersistentes) {
            mensagens.push(efeito.aplicar(this));
            efeito.duracao--;
            if (efeito.duracao > 0) {
                efeitosAtivos.push(efeito);
            }
        }
        this._efeitosPersistentes = efeitosAtivos;

        // Recuperar mana (personagens que usam mana)
        if (this._manaMaxima > 0) {
            this.recuperarMana(Personagem.MANA_RECUPERACAO);
            mensagens.push(`${this.nome} recuperou ${Personagem.MANA_RECUPERACAO} de mana.`);
        }

        // Reduzir contadores de efeitos temporários
        if (this._imunidadeAtaqueBase > 0) this._imunidadeAtaqueBase--;
        if (this._bloqueioCartas > 0) this._bloqueioCartas--;
        if (this._invulnerabilidade > 0) this._invulnerabilidade--;
        if (this._naoPodeAtacar > 0) this._naoPodeAtacar--;

        // Consumir escudos e modificadores baseados em duração de turno
        this._escudos = this._escudos.filter(e => {
            e.duracao--;
            return e.duracao > 0;
        });

        this._modificadoresDano = this._modificadoresDano.filter(m => {
            m.duracao--;
            return m.duracao > 0;
        });

        // Resetar esquiva garantida
        this._esquivaGarantida = false;

        return mensagens;
    }

    // Métodos abstratos para ataques especializados
    abstract ataque1(alvo: Personagem): ResultadoAtaque;
    abstract ataque2(alvo: Personagem): ResultadoAtaque;
    
    // Nomes dos ataques para UI
    abstract get nomeAtaque1(): string;
    abstract get nomeAtaque2(): string;
    abstract get descricaoAtaque1(): string;
    abstract get descricaoAtaque2(): string;
    abstract get custoManaAtaque2(): number;

    // Método para clonar estado (para Inversão Temporal)
    clonarEstado(): PersonagemEstado {
        return {
            vida: this._vida,
            mana: this._mana,
            inventario: [...this._inventario],
            efeitosPersistentes: [...this._efeitosPersistentes],
            modificadoresDano: [...this._modificadoresDano],
            escudos: [...this._escudos]
        };
    }

    restaurarEstado(estado: PersonagemEstado): void {
        this._vida = estado.vida;
        this._mana = estado.mana;
        this._inventario = [...estado.inventario];
        this._efeitosPersistentes = [...estado.efeitosPersistentes];
        this._modificadoresDano = [...estado.modificadoresDano];
        this._escudos = [...estado.escudos];
    }

    // Resetar para nova partida
    resetar(): void {
        this._vida = this._vidaMaxima;
        this._mana = this._manaMaxima;
        this._inventario = [];
        this._efeitosPersistentes = [];
        this._modificadoresDano = [];
        this._escudos = [];
        this._imunidadeAtaqueBase = 0;
        this._bloqueioCartas = 0;
        this._invulnerabilidade = 0;
        this._naoPodeAtacar = 0;
        this._atordoado = false;
        this._esquivaGarantida = false;
        this._proximoAtaqueFalha = false;
        this._reliquiaSagradaAtiva = false;
        this._coroaEspinhosAtiva = false;
        this._mayhemUsadas.clear();
    }
}

/**
 * Interface para armazenar estado do personagem
 */
export interface PersonagemEstado {
    vida: number;
    mana: number;
    inventario: IItem[];
    efeitosPersistentes: IEfeitoPersistente[];
    modificadoresDano: IModificadorDano[];
    escudos: IEscudo[];
}
