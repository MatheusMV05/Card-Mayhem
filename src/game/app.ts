/**
 * Card Mayhem - Demonstração do Sistema
 * 
 * Requsitos que este arquivo demonstra:
 * 1. Criação de personagens de diferentes classes
 * 2. Adição de itens aos personagens
 * 3. Criação da Arena e adição de lutadores
 * 4. Listagem de lutadores
 * 5. Execução de batalha
 * 6. Tratamento de erros
 */

import { Arena } from './arena';
import { Guerreiro, Mago, Arqueiro, Paladino, Necromante, Feiticeiro } from './entities';
import { PocaoVida, PocaoMana, CardFactory } from './items';
import { ManaInsuficienteError, PersonagemMortoError, InventarioCheioError } from './errors';

// ============================================
// 1. Criação de personagens (classes diferentes)
// ============================================

console.log('='.repeat(50));
console.log('CARD MAYHEM - DEMONSTRAÇÃO DO SISTEMA');
console.log('='.repeat(50));
console.log('\n📦 Criando personagens...\n');

// Criar pelo menos 3 personagens de classes diferentes
const guerreiro = new Guerreiro('Thorin');
const mago = new Mago('Gandalf');
const arqueiro = new Arqueiro('Legolas');
const paladino = new Paladino('Arthas');
const necromante = new Necromante('Kel\'Thuzad');
const feiticeiro = new Feiticeiro('Medivh');

console.log(`✅ ${guerreiro.nome} (${guerreiro.classe}) - HP: ${guerreiro.vida}, Mana: ${guerreiro.mana}`);
console.log(`✅ ${mago.nome} (${mago.classe}) - HP: ${mago.vida}, Mana: ${mago.mana}`);
console.log(`✅ ${arqueiro.nome} (${arqueiro.classe}) - HP: ${arqueiro.vida}, Mana: ${arqueiro.mana}`);
console.log(`✅ ${paladino.nome} (${paladino.classe}) - HP: ${paladino.vida}, Mana: ${paladino.mana}`);
console.log(`✅ ${necromante.nome} (${necromante.classe}) - HP: ${necromante.vida}, Mana: ${necromante.mana}`);
console.log(`✅ ${feiticeiro.nome} (${feiticeiro.classe}) - HP: ${feiticeiro.vida}, Mana: ${feiticeiro.mana}`);

// ============================================
// 2. Adicionar itens aos personagens
// ============================================

console.log('\n📦 Adicionando itens aos personagens...\n');

// Adicionar poções básicas
const pocaoVida = new PocaoVida();
const pocaoMana = new PocaoMana();

guerreiro.adicionarItem(pocaoVida);
console.log(`✅ ${guerreiro.nome} recebeu: ${pocaoVida.nome}`);

mago.adicionarItem(pocaoMana);
console.log(`✅ ${mago.nome} recebeu: ${pocaoMana.nome}`);

// Adicionar cartas aleatórias
const cartasGuerreiro = CardFactory.criarCartas(3);
cartasGuerreiro.forEach(carta => {
    guerreiro.adicionarItem(carta);
    console.log(`✅ ${guerreiro.nome} recebeu: ${carta.nome} (${carta.raridade})`);
});

const cartasMago = CardFactory.criarCartas(3);
cartasMago.forEach(carta => {
    mago.adicionarItem(carta);
    console.log(`✅ ${mago.nome} recebeu: ${carta.nome} (${carta.raridade})`);
});

// ============================================
// 3. Criar Arena e adicionar lutadores
// ============================================

console.log('\n🏟️ Criando Arena e adicionando lutadores...\n');

const arena = new Arena();

arena.adicionarLutador(guerreiro);
arena.adicionarLutador(mago);
arena.adicionarLutador(arqueiro);
arena.adicionarLutador(paladino);
arena.adicionarLutador(necromante);
arena.adicionarLutador(feiticeiro);

console.log('✅ Todos os lutadores foram adicionados à arena!');

// ============================================
// 4. Listar lutadores
// ============================================

console.log('\n📋 Lista de Lutadores na Arena:\n');

const lutadores = arena.listarLutadores();
lutadores.forEach((lutador, index) => {
    console.log(`${index + 1}. ${lutador.nome} (${lutador.classe})`);
    console.log(`   ❤️ HP: ${lutador.vida}/${lutador.vidaMaxima}`);
    console.log(`   💧 Mana: ${lutador.mana}/${lutador.manaMaxima}`);
    console.log(`   ⚔️ Ataque: ${lutador.ataque} | 🛡️ Defesa: ${lutador.defesa}`);
    console.log(`   📦 Inventário: ${lutador.inventario.length} itens`);
    console.log('');
});

// ============================================
// 5. Executar batalha
// ============================================

console.log('\n⚔️ INICIANDO BATALHA: Thorin vs Gandalf\n');
console.log('='.repeat(50));

try {
    const resultados = arena.batalhar('Thorin', 'Gandalf');
    resultados.forEach(msg => console.log(msg));
} catch (error) {
    if (error instanceof Error) {
        console.log(`❌ Erro durante a batalha: ${error.message}`);
    }
}

// ============================================
// 6. Demonstrar tratamento de erros
// ============================================

console.log('\n🔧 DEMONSTRAÇÃO DE TRATAMENTO DE ERROS\n');
console.log('='.repeat(50));

// 6.1 - Tentar usar habilidade sem mana suficiente
console.log('\n📌 Teste 1: Mana Insuficiente');
const magoTeste = new Mago('Mago Teste');
magoTeste.mana = 10; // Reduzir mana para menos que o custo da Bola de Fogo (30)

try {
    magoTeste.ataque2(guerreiro); // Bola de Fogo custa 30 de mana
} catch (error) {
    if (error instanceof ManaInsuficienteError) {
        console.log(`✅ Erro capturado corretamente: ${error.message}`);
    }
}

// 6.2 - Tentar atacar com personagem morto
console.log('\n📌 Teste 2: Personagem Morto');
const guerreiroMorto = new Guerreiro('Guerreiro Morto');
guerreiroMorto.vida = 0;

try {
    guerreiroMorto.ataque1(mago);
} catch (error) {
    if (error instanceof PersonagemMortoError) {
        console.log(`✅ Erro capturado corretamente: ${error.message}`);
    }
}

// 6.3 - Tentar adicionar item em inventário cheio
console.log('\n📌 Teste 3: Inventário Cheio');
const guerreiroCheio = new Guerreiro('Guerreiro Cheio');

try {
    // Adicionar 4 itens (máximo)
    for (let i = 0; i < 4; i++) {
        guerreiroCheio.adicionarItem(new PocaoVida());
    }
    // Tentar adicionar o 5º item
    guerreiroCheio.adicionarItem(new PocaoVida());
} catch (error) {
    if (error instanceof InventarioCheioError) {
        console.log(`✅ Erro capturado corretamente: ${error.message}`);
    }
}

// 6.4 - Buscar lutador inexistente
console.log('\n📌 Teste 4: Lutador Não Encontrado');

try {
    arena.buscarLutador('Personagem Inexistente');
} catch (error) {
    if (error instanceof Error) {
        console.log(`✅ Erro capturado corretamente: ${error.message}`);
    }
}

console.log('\n' + '='.repeat(50));
console.log('DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
console.log('='.repeat(50));
console.log('\n🎮 Para jogar o jogo, execute: npm run dev');
console.log('   e acesse http://localhost:5173 no navegador.\n');
