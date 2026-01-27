/**
 * Erro lançado quando não há mana suficiente para usar uma habilidade
 */
export class ManaInsuficienteError extends Error {
    constructor(nomePersonagem: string, custoMana: number, manaAtual: number) {
        super(`${nomePersonagem} não tem mana suficiente! Custo: ${custoMana}, Mana atual: ${manaAtual}`);
        this.name = 'ManaInsuficienteError';
    }
}
