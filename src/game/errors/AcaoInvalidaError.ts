/**
 * Erro lançado quando uma ação inválida é tentada
 */
export class AcaoInvalidaError extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = 'AcaoInvalidaError';
    }
}
