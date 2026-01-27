/**
 * Erro lançado quando um personagem morto tenta realizar uma ação
 */
export class PersonagemMortoError extends Error {
    constructor(nomePersonagem: string) {
        super(`${nomePersonagem} está morto e não pode realizar esta ação!`);
        this.name = 'PersonagemMortoError';
    }
}
