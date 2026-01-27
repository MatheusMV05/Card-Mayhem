/**
 * Erro lançado quando o inventário está cheio
 */
export class InventarioCheioError extends Error {
    constructor(nomePersonagem: string) {
        super(`O inventário de ${nomePersonagem} está cheio! Máximo de 4 itens.`);
        this.name = 'InventarioCheioError';
    }
}
