/**
 * Erro lançado quando um lutador não é encontrado na arena
 */
export class LutadorNaoEncontradoError extends Error {
    constructor(nome: string) {
        super(`Lutador "${nome}" não encontrado na arena!`);
        this.name = 'LutadorNaoEncontradoError';
    }
}
