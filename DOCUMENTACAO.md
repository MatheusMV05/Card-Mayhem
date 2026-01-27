# Card Mayhem - RPG Arena Battle

## 📖 Documentação Completa do Projeto

### Índice
1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação e Execução](#instalação-e-execução)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Arquitetura](#arquitetura)
6. [Classes e Personagens](#classes-e-personagens)
7. [Sistema de Cartas](#sistema-de-cartas)
8. [Sistema de Batalha](#sistema-de-batalha)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Interface do Usuário](#interface-do-usuário)
11. [Demonstração (app.ts)](#demonstração-appts)

---

## Visão Geral

**Card Mayhem** é um jogo de RPG Arena desenvolvido com:
- **Vite** - Build tool rápido e moderno
- **Phaser 3** - Framework de jogos 2D
- **TypeScript** - Tipagem estática e POO

O jogo apresenta batalhas por turnos entre personagens de diferentes classes, utilizando um sistema de cartas de suporte que adicionam estratégia e imprevisibilidade às partidas.

---

## Requisitos

- Node.js 18+
- npm ou yarn
- Navegador moderno (Chrome, Firefox, Edge, Safari)

---

## Instalação e Execução

```bash
# Clonar ou extrair o projeto
cd rpg-game

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

Após executar `npm run dev`, acesse `http://localhost:5173` no navegador.

---

## Estrutura do Projeto

```
rpg-game/
├── src/
│   ├── main.ts                 # Entry point
│   └── game/
│       ├── main.ts             # Configuração do Phaser
│       ├── app.ts              # Demonstração do sistema (para avaliação)
│       ├── enums/              # Enumerações
│       │   ├── ClassePersonagem.ts
│       │   ├── Raridade.ts
│       │   └── index.ts
│       ├── interfaces/         # Interfaces TypeScript
│       │   ├── IItem.ts
│       │   └── index.ts
│       ├── errors/             # Erros personalizados
│       │   ├── PersonagemMortoError.ts
│       │   ├── ManaInsuficienteError.ts
│       │   ├── InventarioCheioError.ts
│       │   ├── LutadorNaoEncontradoError.ts
│       │   ├── AcaoInvalidaError.ts
│       │   └── index.ts
│       ├── entities/           # Classes de personagens
│       │   ├── Personagem.ts   # Classe base
│       │   ├── Guerreiro.ts
│       │   ├── Mago.ts
│       │   ├── Arqueiro.ts
│       │   ├── Paladino.ts
│       │   ├── Necromante.ts
│       │   ├── Feiticeiro.ts
│       │   └── index.ts
│       ├── items/              # Cartas e itens
│       │   ├── Pocoes.ts
│       │   ├── CartasComuns.ts
│       │   ├── CartasRaras.ts
│       │   ├── CartasEpicas.ts
│       │   ├── CartasLendarias.ts
│       │   ├── CartasMayhem.ts
│       │   ├── CardFactory.ts
│       │   └── index.ts
│       ├── arena/              # Sistema de batalha
│       │   ├── Arena.ts
│       │   └── index.ts
│       └── scenes/             # Cenas do Phaser
│           ├── Boot.ts
│           ├── Preloader.ts
│           ├── MainMenu.ts
│           ├── CharacterSelect.ts
│           ├── Battle.ts
│           └── GameOver.ts
├── public/
│   └── style.css
├── index.html
├── package.json
└── tsconfig.json
```

---

## Arquitetura

### Padrões de Design Utilizados

1. **Herança** - Classe base `Personagem` com classes especializadas
2. **Interfaces** - `IItem` define contrato para todos os itens
3. **Factory Pattern** - `CardFactory` para criação de cartas
4. **Strategy Pattern** - Diferentes implementações de ataques por classe
5. **Observer Pattern** - Callbacks para logs de batalha

### Diagrama de Classes Simplificado

```
                    ┌─────────────┐
                    │ Personagem  │ (abstract)
                    │─────────────│
                    │ -_vida      │
                    │ -_mana      │
                    │ -_inventario│
                    │ +atacar()   │
                    │ +curar()    │
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │           │       │       │           │
  ┌────┴────┐ ┌────┴───┐ ┌─┴──┐ ┌──┴───┐ ┌────┴─────┐
  │Guerreiro│ │  Mago  │ │Arq.│ │Palad.│ │Necromante│
  └─────────┘ └────────┘ └────┘ └──────┘ └──────────┘

     ┌──────────┐
     │  IItem   │ (interface)
     │──────────│
     │ +nome    │
     │ +usar()  │
     └────┬─────┘
          │
    ┌─────┴─────┐
    │ Todas as  │
    │  cartas   │
    └───────────┘
```

---

## Classes e Personagens

### Classe Base: Personagem

**Atributos Privados:**
- `_vida`, `_vidaMaxima` - Pontos de vida
- `_mana`, `_manaMaxima` - Pontos de mana
- `_inventario` - Array de IItem (máximo 4 itens)
- `_efeitosPersistentes` - Efeitos de dano ao longo do tempo
- `_modificadoresDano` - Buffs/debuffs de dano
- `_escudos` - Redução de dano

**Atributos Públicos:**
- `nome` (readonly) - Nome do personagem
- `classe` - Enum ClassePersonagem
- `ataque` - Valor de ataque base
- `defesa` - Valor de defesa

**Métodos Obrigatórios:**
- `get/set vida()` - Com validação de limites
- `estaVivo(): boolean` - Verifica se HP > 0
- `atacar(alvo): ResultadoAtaque` - Ataque básico
- `curar(quantidade): void` - Recupera HP
- `adicionarItem(item): void` - Lança InventarioCheioError se cheio
- `usarItem(indice): string` - Lança erro se índice inválido

### Classes Especializadas

#### ⚔️ Guerreiro
- **Vida:** 150 (maior do jogo)
- **Mana:** 0 (não usa)
- **Foco:** Alta durabilidade e força bruta

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Golpe Padrão | 18 de dano físico |
| 2 | Golpe Brutal | 36 de dano (não pode usar em turnos seguidos) |

#### 🔮 Mago
- **Vida:** 80 (menor do jogo)
- **Mana:** 100
- **Foco:** Glass Cannon - alto dano explosivo

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Meditar | Recupera 25 de mana |
| 2 | Bola de Fogo | 54 de dano (custa 30 mana) |

#### 🏹 Arqueiro
- **Vida:** 100
- **Mana:** 50
- **Foco:** Equilíbrio e críticos

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Disparo Ágil | 15 de dano (30% chance crítico = 30 dano) |
| 2 | Flecha Precisa | 25 de dano fixo (custa 15 mana, não pode ser evitado) |

#### 🛡️ Paladino
- **Vida:** 130
- **Mana:** 60
- **Foco:** Tank com sustentação

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Golpe de Fé | 15 de dano + cura 5 HP |
| 2 | Escudo Divino | Reduz próximo dano em 50% (custa 20 mana) |

#### 💀 Necromante
- **Vida:** 90
- **Mana:** 80
- **Foco:** Alto risco e dano persistente

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Toque Debilitante | 10 de dano + 5 dano/turno por 2 turnos |
| 2 | Sacrifício | 35 de dano (custa 10 HP do próprio Necromante) |

#### ✨ Feiticeiro
- **Vida:** 85
- **Mana:** 120
- **Foco:** Combos de mana e dano puro

| Ataque | Nome | Efeito |
|--------|------|--------|
| 1 | Dardo Arcano | 20 de dano (ignora escudos e defesas) |
| 2 | Fluxo de Mana | Próximo ataque causa 1.5x dano (custa 15 mana) |

---

## Sistema de Cartas

### Raridades e Chances

| Raridade | Chance | Cor |
|----------|--------|-----|
| Comum | 70% | Cinza |
| Raro | 50% | Azul |
| Épico | 30% | Roxo |
| Lendário | 20% | Laranja |
| Mayhem | 4% | Vermelho |
| Super Mayhem | 1% | Dourado |

### Cartas Comuns (70%)
- **Poção de Vida** - Cura 10 HP
- **Poção de Mana** - Recupera 20 mana
- **Pedra de Amolar** - +3 dano no próximo ataque
- **Erva Amarga** - Remove debuffs
- **Pergaminho de Visão** - Revela próxima carta do oponente
- **Bandagem Simples** - Cura 5 HP
- **Amuleto de Barro** - Reduz próximo dano em 3
- **Frasco de Óleo** - Aumenta chance de crítico

### Cartas Raras (50%)
- **Elixir de Ferro** - Imunidade a ataques base por 1 turno
- **Cajado Quebrado** - Próximo ataque do inimigo falha
- **Manto de Sombras** - Esquiva garantida
- **Orbe de Cristal** - Troca uma carta do inventário
- **Essência de Sangue** - Rouba 5 HP do inimigo
- **Escudo Espinhoso** - Devolve 30% do dano recebido

### Cartas Épicas (30%)
- **Livro de Feitiços Proibidos** - Reduz HP do oponente pela metade (1x por alvo)
- **Relíquia Sagrada** - Ressuscita com 20% HP se morrer
- **Ankh da Reencarnação** - Troca cartas por 3 épicas
- **Coroa de Espinhos** - Inimigo perde 5 HP por ataque base
- **Cetro de Dominação** - Bloqueia cartas do inimigo por 2 turnos

### Cartas Lendárias (20%)
- **Cálice do Infinito** - Cura todo HP, mas reduz dano pela metade
- **Espada Excalibur** - Próximo ataque causa 2x dano
- **Grimório de Lich** - Invoca lacaio que ataca por 3 turnos
- **Olho de Sauron** - Vê e descarta uma carta do inimigo
- **Capa de Invisibilidade** - Invulnerável por 2 turnos (não pode atacar)
- **Martelo de Thor** - 40 de dano + atordoa inimigo
- **Pedra Filosofal** - Transforma carta comum em Mayhem

### Cartas Mayhem (4%) - Uso Único por Partida
- **Moeda do Apocalipse** - Ambos ficam com 1 HP, rola moeda para próximo turno
- **Buraco Negro** - Remove todas as cartas de ambos pelo resto do jogo
- **Desejo Supremo** - Escolha: +50 HP ou 40 de dano direto
- **Inversão Temporal** - Volta o jogo 3 turnos
- **O Estalo** - Remove metade de tudo (HP, cartas, ataques)

### Carta Super Mayhem (1%)
- **Exodia** - VITÓRIA AUTOMÁTICA!

---

## Sistema de Batalha

### Regras Gerais

1. **Turnos Alternados** - Jogador e CPU alternam turnos
2. **Uma Ação por Turno** - Escolher entre:
   - Usar Ataque 1
   - Usar Ataque 2
   - Usar uma Carta de Suporte
3. **Recuperação de Mana** - +40 mana por turno (para classes que usam mana)
4. **Cartas Rotativas** - A cada turno, novas cartas são distribuídas
5. **Objetivo** - Reduzir a vida do oponente a 0

### Classe Arena

**Atributos:**
- `lutadores` - Array de Personagem
- `jogador1`, `jogador2` - Combatentes ativos
- `turnoAtual` - Contador de turnos
- `logs` - Histórico de ações

**Métodos Obrigatórios:**
- `adicionarLutador(lutador): void`
- `listarLutadores(): Personagem[]`
- `buscarLutador(nome): Personagem` - Lança erro se não encontrar
- `batalhar(nome1, nome2): string[]` - Executa batalha automática

### Fluxo de Batalha

```
┌─────────────────┐
│  Iniciar Turno  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aplicar Efeitos │
│  Persistentes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Recuperar Mana  │
│     (+40)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Distribuir      │
│ Novas Cartas    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Jogador Escolhe │──────│  Usar Carta  │
│     Ação        │      └──────────────┘
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│Ataque1│ │Ataque2│
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────┐
│ Verificar Fim   │
│   de Batalha    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│Próximo│ │ Fim   │
│ Turno │ │ Jogo  │
└───────┘ └───────┘
```

---

## Tratamento de Erros

### Erros Personalizados

#### PersonagemMortoError
```typescript
class PersonagemMortoError extends Error {
    constructor(nomePersonagem: string) {
        super(`${nomePersonagem} está morto e não pode realizar esta ação!`);
    }
}
```
**Uso:** Validar se atacante e alvo estão vivos em `atacar()`

#### ManaInsuficienteError
```typescript
class ManaInsuficienteError extends Error {
    constructor(nomePersonagem: string, custoMana: number, manaAtual: number) {
        super(`${nomePersonagem} não tem mana suficiente! Custo: ${custoMana}, Mana atual: ${manaAtual}`);
    }
}
```
**Uso:** Validar mana antes de usar habilidades como `bolaDeFogo()`

#### InventarioCheioError
```typescript
class InventarioCheioError extends Error {
    constructor(nomePersonagem: string) {
        super(`O inventário de ${nomePersonagem} está cheio! Máximo de 4 itens.`);
    }
}
```
**Uso:** Validar capacidade em `adicionarItem()`

#### LutadorNaoEncontradoError
```typescript
class LutadorNaoEncontradoError extends Error {
    constructor(nome: string) {
        super(`Lutador "${nome}" não encontrado na arena!`);
    }
}
```
**Uso:** Buscar lutadores em `buscarLutador()`

### Uso de try/catch

```typescript
try {
    const resultado = arena.executarAtaque(2);
} catch (error) {
    if (error instanceof ManaInsuficienteError) {
        console.log('Não há mana suficiente!');
    } else if (error instanceof PersonagemMortoError) {
        console.log('Personagem já está morto!');
    }
}
```

---

## Interface do Usuário

### Cenas do Jogo

1. **Boot** - Inicialização
2. **Preloader** - Carregamento de assets
3. **MainMenu** - Menu principal com opções Play e PvP
4. **CharacterSelect** - Seleção de personagem com preview
5. **Battle** - Cena principal de combate
6. **GameOver** - Resultado da partida

### Layout da Batalha

```
┌─────────────────────────────────────────────────┐
│                  Turno X                         │
├─────────────────────────────────────────────────┤
│                              [Oponente HP/Mana] │
│                                  ⬤              │
│                                                  │
│      ⬤                          [Histórico]    │
│   [Jogador]                      [  Logs    ]    │
│                                  [  Ações   ]    │
│  [HP Bar]                                        │
│  [Mana Bar]                                      │
├─────────────────────────────────────────────────┤
│  ┌─────────┐  │  ┌─────────────────────────────┐│
│  │Ataques  │  │  │     Cartas de Suporte       ││
│  │┌───────┐│  │  │┌────┐┌────┐┌────┐┌────┐    ││
│  ││ Atq 1 ││  │  ││Card││Card││Card││Card│    ││
│  │└───────┘│  │  │└────┘└────┘└────┘└────┘    ││
│  │┌───────┐│  │  │                             ││
│  ││ Atq 2 ││  │  │                             ││
│  │└───────┘│  │  │                             ││
│  └─────────┘  │  └─────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Cores por Raridade

- **Comum:** `#9d9d9d` (Cinza)
- **Raro:** `#0070dd` (Azul)
- **Épico:** `#a335ee` (Roxo)
- **Lendário:** `#ff8000` (Laranja)
- **Mayhem:** `#ff0040` (Vermelho)
- **Super Mayhem:** `#ffd700` (Dourado)

---

## Demonstração (app.ts)

O arquivo `src/game/app.ts` contém uma demonstração completa do sistema, incluindo:

1. ✅ Criação de 6 personagens (todas as classes)
2. ✅ Adição de itens (poções e cartas aleatórias)
3. ✅ Criação da Arena e adição de lutadores
4. ✅ Listagem de todos os lutadores
5. ✅ Execução de batalha automática
6. ✅ Demonstração de tratamento de erros:
   - ManaInsuficienteError
   - PersonagemMortoError
   - InventarioCheioError
   - LutadorNaoEncontradoError

Para executar a demonstração:
```bash
npx ts-node src/game/app.ts
# ou
npm run dev # e verificar no console do navegador
```

---

## Tecnologias Utilizadas

- **TypeScript 5.7** - Tipagem estática
- **Phaser 3.90** - Engine de jogos 2D
- **Vite 6.3** - Build tool
- **POO** - Herança, Polimorfismo, Encapsulamento

---

## Licença

MIT License

---

## Autor

Desenvolvido como projeto final de RPG Arena, demonstrando conceitos de TypeScript e Programação Orientada a Objetos.

---

*Card Mayhem © 2026 - Todos os direitos reservados*
