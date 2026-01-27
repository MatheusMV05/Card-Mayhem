/**
 * Enum que define as raridades das cartas e itens
 */
export enum Raridade {
    Comum = 'Comum',
    Incomum = 'Incomum',
    Raro = 'Raro',
    Epico = 'Épico',
    Lendario = 'Lendário',
    Mayhem = 'Mayhem',
    SuperMayhem = 'Super Mayhem'
}

/**
 * Cores associadas a cada raridade para UI
 */
export const RaridadeCores: Record<Raridade, number> = {
    [Raridade.Comum]: 0x9d9d9d,      // Cinza
    [Raridade.Incomum]: 0x1eff00,    // Verde
    [Raridade.Raro]: 0x0070dd,       // Azul
    [Raridade.Epico]: 0xa335ee,      // Roxo
    [Raridade.Lendario]: 0xff8000,   // Laranja
    [Raridade.Mayhem]: 0xff0040,     // Vermelho vibrante
    [Raridade.SuperMayhem]: 0xffd700 // Dourado
};

/**
 * Chance de aparição de cada raridade (em porcentagem)
 */
export const RaridadeChance: Record<Raridade, number> = {
    [Raridade.Comum]: 70,
    [Raridade.Incomum]: 50,
    [Raridade.Raro]: 50,
    [Raridade.Epico]: 30,
    [Raridade.Lendario]: 20,
    [Raridade.Mayhem]: 4,
    [Raridade.SuperMayhem]: 1
};
