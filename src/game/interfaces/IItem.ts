import { Raridade } from '../enums';
import type { Personagem } from '../entities/Personagem';

/**
 * Interface base para todos os itens do jogo
 */
export interface IItem {
    /** Nome do item */
    nome: string;
    
    /** Descrição do efeito do item */
    descricao: string;
    
    /** Raridade do item */
    raridade: Raridade;
    
    /** Se é uma carta Mayhem (uso único por partida) */
    isMayhem: boolean;
    
    /**
     * Método para usar o item
     * @param usuario - Personagem que está usando o item
     * @param alvo - Personagem alvo do item (opcional)
     * @returns Mensagem descrevendo o efeito
     */
    usar(usuario: Personagem, alvo?: Personagem): string;
}

/**
 * Interface para cartas que aplicam efeitos persistentes
 */
export interface IEfeitoPersistente {
    /** Nome do efeito */
    nome: string;
    
    /** Duração em turnos */
    duracao: number;
    
    /** Aplicar o efeito no início do turno */
    aplicar(personagem: Personagem): string;
}

/**
 * Interface para modificadores de dano
 */
export interface IModificadorDano {
    /** Multiplicador de dano (1.5 = 50% mais dano) */
    multiplicador: number;
    
    /** Duração em ataques */
    duracao: number;
}

/**
 * Interface para estado de escudo
 */
export interface IEscudo {
    /** Porcentagem de redução (0.5 = 50%) */
    reducao: number;
    
    /** Duração em hits */
    duracao: number;
}
