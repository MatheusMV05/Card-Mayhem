# Card Mayhem - RPG Arena Battle

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Phaser](https://img.shields.io/badge/Phaser-3.90-purple)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

**Um jogo de RPG Arena por turnos com sistema de cartas estrategico**

[Jogar](#instalacao-e-execucao) | [Documentacao](#arquitetura-do-projeto) | [Cartas](#sistema-de-cartas) | [Classes](#classes-de-personagens)

</div>

---

## Indice

- [Visao Geral](#visao-geral)
- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalacao e Execucao](#instalacao-e-execucao)
- [Demonstracao do Sistema](#demonstracao-do-sistema)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Classes de Personagens](#classes-de-personagens)
- [Sistema de Cartas](#sistema-de-cartas)
- [Sistema de Batalha](#sistema-de-batalha)
- [Tratamento de Erros](#tratamento-de-erros)
- [Interface do Usuario](#interface-do-usuario)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Comandos Disponiveis](#comandos-disponiveis)
- [Licenca](#licenca)

---

## Visao Geral

**Card Mayhem** e um jogo de RPG Arena desenvolvido em TypeScript com Phaser 3, apresentando batalhas estrategicas por turnos onde jogadores escolhem entre 6 classes unicas de personagens e utilizam um sistema dinamico de cartas de suporte para vencer seus oponentes.

### Caracteristicas Principais

- **6 Classes Unicas** - Guerreiro, Mago, Arqueiro, Paladino, Necromante e Feiticeiro
- **32 Cartas de Suporte** - De comuns a lendarias, incluindo as devastadoras cartas Mayhem
- **Combate Estrategico** - Sistema de turnos com ataques, habilidades e cartas
- **Trilha Sonora Imersiva** - Musicas tematicas para cada momento do jogo
- **Visual Medieval** - Interface tematica com fonte pixel art 8-bit

---

## Requisitos do Sistema

| Requisito | Versao Minima |
|-----------|---------------|
| Node.js | 18.0+ |
| npm | 9.0+ |
| Navegador | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |

---

## Instalacao e Execucao

### Instalacao

```bash
# Clone o repositorio
git clone https://github.com/MatheusMV05/Card-Mayhem.git

# Entre no diretorio
cd Card-Mayhem

# Instale as dependencias
npm install
```

### Executar o Jogo

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev
```

Apos executar, acesse **http://localhost:8080** no navegador.

### Build para Producao

```bash
# Gerar build otimizado
npm run build
```

Os arquivos serao gerados na pasta `dist/`.

---

## Demonstracao do Sistema

O projeto inclui um arquivo de demonstracao (`src/game/app.ts`) que exemplifica todos os conceitos de TypeScript e POO utilizados no jogo, incluindo:

1. Criacao de personagens de diferentes classes
2. Adicao de itens aos personagens
3. Criacao da Arena e adicao de lutadores
4. Listagem de lutadores
5. Execucao de batalha automatica
6. Tratamento de erros personalizados

### Executar a Demonstracao

```bash
# Usando tsx (recomendado)
npx tsx src/game/app.ts
```

### Saida Esperada

```
==================================================
CARD MAYHEM - DEMONSTRACAO DO SISTEMA
==================================================

Criando personagens...

Thorin (Guerreiro) - HP: 150, Mana: 0
Gandalf (Mago) - HP: 80, Mana: 100
Legolas (Arqueiro) - HP: 100, Mana: 50
...

INICIANDO BATALHA: Thorin vs Gandalf
...

DEMONSTRACAO DE TRATAMENTO DE ERROS

Teste 1: Mana Insuficiente
Erro capturado corretamente: Mago Teste nao tem mana suficiente!

Teste 2: Personagem Morto
Erro capturado corretamente: Guerreiro Morto esta morto!

Teste 3: Inventario Cheio
Erro capturado corretamente: O inventario de Guerreiro Cheio esta cheio!

==================================================
DEMONSTRACAO CONCLUIDA COM SUCESSO!
==================================================
```

> **Nota:** A demonstracao e independente do jogo e serve apenas para validar os conceitos de POO. Nao afeta o funcionamento do jogo em si.

---

## Estrutura do Projeto

```
Card-Mayhem/
|-- index.html              # Pagina HTML principal
|-- package.json            # Configuracoes e dependencias
|-- tsconfig.json           # Configuracao do TypeScript
|-- README.md               # Documentacao (este arquivo)
|
|-- public/                 # Assets publicos
|   |-- style.css          # Estilos globais
|   +-- assets/            # Imagens, audio, fontes
|       |-- audio/         # Trilhas sonoras
|       +-- fonts/         # Fonte EightBitDragon
|
|-- src/                    # Codigo fonte
|   |-- main.ts            # Entry point da aplicacao
|   |-- vite-env.d.ts      # Tipos do Vite
|   |
|   +-- game/              # Codigo do jogo
|       |-- main.ts        # Configuracao do Phaser
|       |-- app.ts         # Demonstracao do sistema
|       |
|       |-- enums/         # Enumeracoes
|       |   |-- ClassePersonagem.ts
|       |   |-- Raridade.ts
|       |   +-- index.ts
|       |
|       |-- interfaces/    # Interfaces TypeScript
|       |   |-- IItem.ts
|       |   +-- index.ts
|       |
|       |-- errors/        # Erros personalizados
|       |   |-- PersonagemMortoError.ts
|       |   |-- ManaInsuficienteError.ts
|       |   |-- InventarioCheioError.ts
|       |   |-- LutadorNaoEncontradoError.ts
|       |   |-- AcaoInvalidaError.ts
|       |   +-- index.ts
|       |
|       |-- entities/      # Classes de personagens
|       |   |-- Personagem.ts    # Classe base abstrata
|       |   |-- Guerreiro.ts
|       |   |-- Mago.ts
|       |   |-- Arqueiro.ts
|       |   |-- Paladino.ts
|       |   |-- Necromante.ts
|       |   |-- Feiticeiro.ts
|       |   +-- index.ts
|       |
|       |-- items/         # Sistema de cartas
|       |   |-- Pocoes.ts
|       |   |-- CartasComuns.ts
|       |   |-- CartasRaras.ts
|       |   |-- CartasEpicas.ts
|       |   |-- CartasLendarias.ts
|       |   |-- CartasMayhem.ts
|       |   |-- CardFactory.ts
|       |   +-- index.ts
|       |
|       |-- arena/         # Sistema de batalha
|       |   |-- Arena.ts
|       |   +-- index.ts
|       |
|       +-- scenes/        # Cenas do Phaser
|           |-- Boot.ts
|           |-- Preloader.ts
|           |-- MainMenu.ts
|           |-- CharacterSelect.ts
|           |-- Battle.ts
|           +-- GameOver.ts
|
+-- vite/                   # Configuracoes do Vite
    |-- config.dev.mjs
    +-- config.prod.mjs
```

---

## Arquitetura do Projeto

### Padroes de Design Utilizados

| Padrao | Uso no Projeto |
|--------|----------------|
| **Heranca** | Classe base `Personagem` com 6 classes especializadas |
| **Interface** | `IItem` define contrato para todas as cartas |
| **Factory** | `CardFactory` para criacao de cartas com raridades |
| **Strategy** | Diferentes implementacoes de ataques por classe |
| **Observer** | Callbacks para logs de batalha em tempo real |
| **State** | Gerenciamento de efeitos persistentes e buffs |

### Diagrama de Classes

```
                         +------------------+
                         |   <<abstract>>   |
                         |   Personagem     |
                         +------------------+
                         | - _vida: number  |
                         | - _mana: number  |
                         | - _inventario[]  |
                         | + nome: string   |
                         | + classe: Enum   |
                         +------------------+
                         | + atacar()       |
                         | + curar()        |
                         | + adicionarItem()|
                         | + usarItem()     |
                         | + estaVivo()     |
                         +--------+---------+
                                  |
        +---------+-------+-------+-------+---------+----------+
        |         |       |       |       |         |          |
   +----+----++---+---++--+--++---+---++--+--++-----+-----+    |
   |Guerreiro|| Mago  ||Arq. ||Palad. ||Necro|| Feiticeiro|    |
   +---------++-------++-----++-------++-----++-----------+    |
                                                                |
                    +-------------------------------------------+
                    |
             +------+------+
             | <<interface>>|
             |    IItem     |
             +--------------+
             | + nome       |
             | + descricao  |
             | + raridade   |
             | + usar()     |
             +------+-------+
                    |
    +---------------+---------------+
    |               |               |
+---+---+    +------+------+   +----+----+
|Pocoes |    |CartasComuns |   | Mayhem  |
+-------+    |CartasRaras  |   +---------+
             |CartasEpicas |
             |CartasLend.  |
             +-------------+

             +--------------+
             |    Arena     |
             +--------------+
             | - lutadores[]|
             | - turnoAtual |
             | - logs[]     |
             +--------------+
             | + batalhar() |
             | + buscar()   |
             | + adicionar()|
             +--------------+
```

---

## Classes de Personagens

### Classe Base: Personagem

A classe `Personagem` e abstrata e define a estrutura base para todas as classes jogaveis.

#### Atributos Privados

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| `_vida` | number | Pontos de vida atuais |
| `_vidaMaxima` | number | HP maximo |
| `_mana` | number | Pontos de mana atuais |
| `_manaMaxima` | number | Mana maxima |
| `_inventario` | IItem[] | Array de cartas (max. 4) |
| `_efeitosPersistentes` | IEfeitoPersistente[] | DoTs e HoTs ativos |
| `_modificadoresDano` | IModificadorDano[] | Buffs de dano |
| `_escudos` | IEscudo[] | Reducao de dano |

#### Atributos Publicos

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| `nome` | string (readonly) | Nome do personagem |
| `classe` | ClassePersonagem | Enum da classe |
| `ataque` | number | Valor de ataque base |
| `defesa` | number | Valor de defesa |

#### Metodos Principais

```typescript
// Getters e Setters com validacao
get vida(): number
set vida(valor: number)  // Valida limites 0 ~ vidaMaxima

// Verificacoes de estado
estaVivo(): boolean      // Retorna vida > 0
podeAtacar(): boolean    // Verifica bloqueios
podeUsarCartas(): boolean

// Acoes de combate
atacar(alvo: Personagem): ResultadoAtaque
curar(quantidade: number): void
receberDano(quantidade: number): number

// Gerenciamento de inventario
adicionarItem(item: IItem): void  // Lanca InventarioCheioError
usarItem(indice: number): string  // Lanca AcaoInvalidaError
```

---

### Guerreiro

> *"Forca bruta e a melhor estrategia"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **150** | Maior HP do jogo |
| Mana | **0** | Nao utiliza mana |
| Ataque | **18** | Alto dano base |
| Defesa | **15** | Boa resistencia |

| Habilidade | Descricao |
|------------|-----------|
| **Golpe Padrao** | Causa 18 de dano fisico direto |
| **Golpe Brutal** | Causa 36 de dano (2x). Nao pode usar em turnos consecutivos |

---

### Mago

> *"O poder arcano nao conhece limites"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **80** | Menor HP (glass cannon) |
| Mana | **100** | Alta reserva de mana |
| Ataque | **18** | Base para calculo de feiticos |
| Defesa | **5** | Muito vulneravel |

| Habilidade | Custo | Descricao |
|------------|-------|-----------|
| **Meditar** | - | Recupera 25 de mana |
| **Bola de Fogo** | 45 mana | Causa 27 de dano magico (1.5x ataque) |

---

### Arqueiro

> *"Precisao e tudo"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **100** | Equilibrado |
| Mana | **50** | Moderada |
| Ataque | **15** | Dano base |
| Defesa | **10** | Media |

| Habilidade | Custo | Descricao |
|------------|-------|-----------|
| **Disparo Agil** | - | 15 de dano. **30% chance de critico** (dano dobrado) |
| **Flecha Precisa** | 15 mana | 25 de dano fixo. **Nao pode ser evitado** |

---

### Paladino

> *"A luz divina me protege"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **130** | Alta durabilidade |
| Mana | **60** | Para habilidades divinas |
| Ataque | **15** | Moderado |
| Defesa | **18** | Maior defesa do jogo |

| Habilidade | Custo | Descricao |
|------------|-------|-----------|
| **Golpe de Fe** | - | 15 de dano + cura 5 HP em si mesmo |
| **Escudo Divino** | 20 mana | Reduz proximo dano recebido em 50% |

---

### Necromante

> *"A morte e apenas o comeco"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **90** | Fragil |
| Mana | **80** | Boa reserva |
| Ataque | **10** | Baixo dano direto |
| Defesa | **8** | Vulneravel |

| Habilidade | Custo | Descricao |
|------------|-------|-----------|
| **Toque Debilitante** | - | 10 de dano + aplica 5 dano/turno por 2 turnos |
| **Sacrificio** | 10 HP | 35 de dano. **Custa HP proprio, nao mana** |

---

### Feiticeiro

> *"O mana flui atraves de mim"*

| Atributo | Valor | Descricao |
|----------|-------|-----------|
| Vida | **85** | Fragil |
| Mana | **120** | Maior mana do jogo |
| Ataque | **20** | Bom dano base |
| Defesa | **6** | Muito vulneravel |

| Habilidade | Custo | Descricao |
|------------|-------|-----------|
| **Dardo Arcano** | - | 20 de dano. **Ignora escudos e defesas** |
| **Fluxo de Mana** | 15 mana | Proximo ataque causa 1.5x dano |

---

## Sistema de Cartas

As cartas de suporte adicionam uma camada estrategica ao combate. Cada jogador pode ter ate **4 cartas** no inventario, que sao distribuidas automaticamente a cada turno.

### Raridades e Chances de Drop

| Raridade | Chance | Cor | Poder |
|----------|--------|-----|-------|
| Comum | 70% | `#9d9d9d` | Efeitos basicos |
| Raro | 50% | `#0070dd` | Efeitos taticos |
| Epico | 30% | `#a335ee` | Efeitos poderosos |
| Lendario | 20% | `#ff8000` | Efeitos game-changing |
| Mayhem | 4% | `#ff0040` | Efeitos caoticos (uso unico) |
| Super Mayhem | 1% | `#ffd700` | Vitoria instantanea |

---

### Cartas Comuns

| Carta | Efeito |
|-------|--------|
| **Pocao de Vida** | Cura 10 HP |
| **Pocao de Mana** | Recupera 20 de mana |
| **Pedra de Amolar** | +3 dano no proximo ataque |
| **Erva Amarga** | Remove todos os debuffs ativos |
| **Pergaminho de Visao** | Revela a proxima carta do oponente |
| **Bandagem Simples** | Cura 5 HP |
| **Amuleto de Barro** | Reduz proximo dano recebido em 3 |
| **Frasco de Oleo** | Aumenta chance de critico em 20% |

---

### Cartas Raras

| Carta | Efeito |
|-------|--------|
| **Elixir de Ferro** | Imunidade a ataques basicos por 1 turno |
| **Cajado Quebrado** | O proximo ataque do inimigo falha automaticamente |
| **Manto de Sombras** | Garante esquiva no proximo ataque recebido |
| **Orbe de Cristal** | Troca sua pior carta por uma nova aleatoria |
| **Essencia de Sangue** | Rouba 5 HP do inimigo (dano + cura) |
| **Escudo Espinhoso** | Inimigo recebe 30% do dano que causar |

---

### Cartas Epicas

| Carta | Efeito |
|-------|--------|
| **Livro de Feiticos Proibidos** | Reduz HP do oponente pela metade (1x por alvo na partida) |
| **Reliquia Sagrada** | Se morrer, ressuscita com 20% do HP maximo |
| **Ankh da Reencarnacao** | Descarta todas as cartas e recebe 3 cartas epicas |
| **Coroa de Espinhos** | Inimigo perde 5 HP cada vez que usar ataque basico |
| **Cetro de Dominacao** | Bloqueia o uso de cartas do inimigo por 2 turnos |

---

### Cartas Lendarias

| Carta | Efeito |
|-------|--------|
| **Calice do Infinito** | Cura todo o HP, mas reduz dano causado pela metade |
| **Espada Excalibur** | Proximo ataque causa o dobro de dano |
| **Grimorio de Lich** | Invoca um lacaio que causa 10 de dano por 3 turnos |
| **Olho de Sauron** | Veja e descarte uma carta do inventario do inimigo |
| **Capa de Invisibilidade** | Invulneravel por 2 turnos (nao pode atacar durante) |
| **Martelo de Thor** | Causa 40 de dano e atordoa o inimigo por 1 turno |
| **Pedra Filosofal** | Transforma uma carta comum em uma carta Mayhem |

---

### Cartas Mayhem (Uso Unico por Partida)

> ATENCAO: Cartas Mayhem so podem ser usadas **uma vez por partida**. Seus efeitos sao extremamente poderosos e imprevisiveis!

| Carta | Efeito |
|-------|--------|
| **Moeda do Apocalipse** | Ambos os jogadores ficam com 1 HP. Joga uma moeda para decidir quem age primeiro |
| **Buraco Negro** | Remove **todas** as cartas de ambos os jogadores pelo resto da partida |
| **Desejo Supremo** | Se HP < 50%: cura 50 HP. Se HP >= 50%: causa 40 de dano direto |
| **Inversao Temporal** | Reverte o estado do jogo para 3 turnos atras |
| **O Estalo** | Remove metade de tudo: HP, mana e cartas de ambos |

---

### Carta Super Mayhem (1% de chance)

| Carta | Efeito |
|-------|--------|
| **EXODIA** | **VITORIA INSTANTANEA!** O jogo termina imediatamente |

---

## Sistema de Batalha

### Regras Gerais

1. **Turnos Alternados** - Jogador e oponente alternam turnos
2. **Uma Acao por Turno** - Escolher entre:
   - Usar Ataque 1 (basico)
   - Usar Ataque 2 (especial, pode custar mana)
   - Usar uma Carta de Suporte
3. **Recuperacao de Mana** - +15 mana por turno automaticamente
4. **Cartas Rotativas** - Novas cartas sao distribuidas quando ha espaco
5. **Objetivo** - Reduzir a vida do oponente a 0

### Fluxo de Turno

```
+---------------------+
|   INICIO DO TURNO   |
+----------+----------+
           |
           v
+---------------------+
| Aplicar Efeitos     |
| Persistentes (DoTs) |
+----------+----------+
           |
           v
+---------------------+
| Recuperar Mana      |
|      (+15)          |
+----------+----------+
           |
           v
+---------------------+
| Distribuir Novas    |
| Cartas (se espaco)  |
+----------+----------+
           |
           v
+---------------------+
|  JOGADOR ESCOLHE    |
|      ACAO           |
+---------------------+
| [Ataque 1]          |
| [Ataque 2]          |
| [Carta 1-4]         |
+----------+----------+
           |
           v
+---------------------+
| Executar Acao       |
| Calcular Dano/Efeito|
+----------+----------+
           |
           v
+---------------------+
| Verificar Fim       |<---- HP <= 0?
| de Batalha          |
+----------+----------+
           |
     +-----+-----+
     |           |
   [Nao]       [Sim]
     |           |
     v           v
+---------+ +---------+
| Proximo | | GAME    |
| Turno   | | OVER    |
+---------+ +---------+
```

### Classe Arena

A classe `Arena` gerencia todo o sistema de batalha.

```typescript
class Arena {
    // Atributos
    private lutadores: Personagem[];
    private _jogador1: Personagem | null;
    private _jogador2: Personagem | null;
    private _turnoAtual: number;
    private _turnoJogador1: boolean;
    private _batalhaAtiva: boolean;
    private _logs: LogBatalha[];
    private _vencedor: Personagem | null;

    // Metodos obrigatorios
    adicionarLutador(lutador: Personagem): void
    listarLutadores(): Personagem[]
    buscarLutador(nome: string): Personagem  // Lanca erro se nao encontrar
    batalhar(nome1: string, nome2: string): string[]  // Batalha automatica
    
    // Metodos de controle
    iniciarBatalha(jogador1: Personagem, jogador2: Personagem): void
    executarAtaque(numeroAtaque: 1 | 2): ResultadoAcao
    usarCarta(indiceCarta: number): ResultadoAcao
    iniciarTurno(): string[]
    finalizarTurno(): void
}
```

---

## Tratamento de Erros

O projeto utiliza classes de erro personalizadas que estendem `Error` para tratamento especifico de excecoes.

### Erros Personalizados

#### PersonagemMortoError

```typescript
class PersonagemMortoError extends Error {
    constructor(nomePersonagem: string) {
        super(`${nomePersonagem} esta morto e nao pode realizar esta acao!`);
        this.name = 'PersonagemMortoError';
    }
}
```

**Quando e lancado:**
- Tentar atacar com personagem morto
- Tentar atacar um alvo morto
- Tentar usar habilidade com personagem morto

---

#### ManaInsuficienteError

```typescript
class ManaInsuficienteError extends Error {
    constructor(nomePersonagem: string, custoMana: number, manaAtual: number) {
        super(`${nomePersonagem} nao tem mana suficiente! Custo: ${custoMana}, Mana atual: ${manaAtual}`);
        this.name = 'ManaInsuficienteError';
    }
}
```

**Quando e lancado:**
- Usar Bola de Fogo sem mana suficiente
- Usar Flecha Precisa sem mana suficiente
- Usar qualquer habilidade que custe mana

---

#### InventarioCheioError

```typescript
class InventarioCheioError extends Error {
    constructor(nomePersonagem: string) {
        super(`O inventario de ${nomePersonagem} esta cheio! Maximo de 4 itens.`);
        this.name = 'InventarioCheioError';
    }
}
```

**Quando e lancado:**
- Tentar adicionar carta quando inventario tem 4 itens

---

#### LutadorNaoEncontradoError

```typescript
class LutadorNaoEncontradoError extends Error {
    constructor(nome: string) {
        super(`Lutador "${nome}" nao encontrado na arena!`);
        this.name = 'LutadorNaoEncontradoError';
    }
}
```

**Quando e lancado:**
- Buscar lutador com nome inexistente na Arena

---

### Exemplo de Uso com try/catch

```typescript
try {
    // Tentar usar Bola de Fogo
    const resultado = mago.ataque2(inimigo);
    console.log(resultado.mensagem);
} catch (error) {
    if (error instanceof ManaInsuficienteError) {
        console.log('Mana insuficiente! Medite primeiro.');
    } else if (error instanceof PersonagemMortoError) {
        console.log('Alvo ja esta morto!');
    } else {
        throw error; // Re-lancar erros desconhecidos
    }
}
```

---

## Interface do Usuario

### Cenas do Jogo

| Cena | Descricao |
|------|-----------|
| **Boot** | Inicializacao do jogo |
| **Preloader** | Carregamento de assets com barra de progresso |
| **MainMenu** | Menu principal com botao Play |
| **CharacterSelect** | Grade de selecao das 6 classes com preview |
| **Battle** | Cena principal de combate |
| **GameOver** | Resultado da partida com opcao de reiniciar |

### Layout da Batalha

```
+--------------------------------------------------------------+
|                         TURNO 5                              |
+--------------------------------------------------------------+
|                                                              |
|                              [OPONENTE]                      |
|                              HP: xxxxxxxx-- 80/100           |
|                              Mana: xxx------- 30/100         |
|                                   O                          |
|                                                              |
|                                                              |
|        O                                                     |
|   [JOGADOR]                  +----------------------------+  |
|   HP: xxxxxxxxxx 150/150     |     HISTORICO             |  |
|   Mana: ---------- 0/0       |  Turno 4: Golpe Brutal!   |  |
|                              |  Causou 36 de dano!       |  |
|                              |  Turno 5: CPU meditou...  |  |
|                              +----------------------------+  |
+--------------------------------------------------------------+
| +--------------+  |  +-------------------------------------+ |
| |   ATAQUES    |  |  |        CARTAS DE SUPORTE            | |
| |              |  |  |                                     | |
| | +----------+ |  |  | +--------++--------++--------+     | |
| | | Golpe    | |  |  | | Pocao  || Manto  || Livro  |     | |
| | | Padrao   | |  |  | |  Vida  ||Sombras ||Proibido|     | |
| | +----------+ |  |  | +--------++--------++--------+     | |
| | +----------+ |  |  |                                     | |
| | | Golpe    | |  |  |                                     | |
| | | Brutal   | |  |  |                                     | |
| | +----------+ |  |  |                                     | |
| +--------------+  |  +-------------------------------------+ |
+--------------------------------------------------------------+
```

### Tema Visual

O jogo utiliza um tema medieval com:
- **Fonte:** EightBitDragon (pixel art 8-bit)
- **Cores:** Tons de ouro, pergaminho e couro
- **Bordas:** Arredondadas com brilho dourado

---

## Tecnologias Utilizadas

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| **TypeScript** | 5.7.2 | Tipagem estatica e POO |
| **Phaser 3** | 3.90.0 | Engine de jogos 2D |
| **Vite** | 6.3.2 | Build tool e dev server |
| **Node.js** | 18+ | Ambiente de execucao |

### Conceitos de POO Demonstrados

- **Classes e Objetos**
- **Heranca** (classe base Personagem)
- **Polimorfismo** (metodos sobrescritos por classe)
- **Encapsulamento** (atributos privados com getters/setters)
- **Abstracao** (classe abstrata Personagem)
- **Interfaces** (IItem para todas as cartas)
- **Composicao** (Arena composta por Personagens)
- **Tratamento de Excecoes** (erros personalizados)

---

## Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Iniciar servidor de desenvolvimento |
| `npm run build` | Gerar build de producao |
| `npx tsx src/game/app.ts` | Executar demonstracao do sistema |

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Card Mayhem** - 2026

Desenvolvido com TypeScript, Phaser 3 e Vite

[Voltar ao topo](#card-mayhem---rpg-arena-battle)

</div>
