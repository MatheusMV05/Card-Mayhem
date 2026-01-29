import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Moeda do Apocalipse - Ambos os jogadores ficam com 1 de HP e rola uma moeda para ver de quem será o próximo turno
 * O resultado da moeda é armazenado para que a Arena possa usar
 */
export class MoedaDoApocalipse implements IItem {
    nome = 'Moeda do Apocalipse';
    descricao = 'Ambos os jogadores ficam com 1 de HP. Rola moeda para próximo turno.';
    raridade = Raridade.Mayhem;
    isMayhem = true;
    
    // Armazena se o usuário ganhou a moeda (para a Arena usar)
    static ultimoResultado: { usuarioGanhou: boolean } | null = null;

    usar(usuario: Personagem, alvo?: Personagem): string {
        usuario.vida = 1;
        if (alvo) {
            alvo.vida = 1;
        }
        
        // Jogar a moeda
        const usuarioGanhou = Math.random() < 0.5;
        MoedaDoApocalipse.ultimoResultado = { usuarioGanhou };
        
        const proximo = usuarioGanhou ? usuario.nome : alvo?.nome || 'oponente';
        return `MAYHEM! Moeda do Apocalipse! Ambos têm 1 HP! ${proximo} joga próximo!`;
    }
}

/**
 * Buraco Negro - Remove todas as cartas de suporte de ambos os jogadores pelo resto do jogo
 */
export class BuracoNegro implements IItem {
    nome = 'Buraco Negro';
    descricao = 'Remove todas as cartas de suporte de ambos os jogadores pelo resto do jogo.';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        usuario.limparInventario();
        usuario.setBloqueioCartas(999);
        if (alvo) {
            alvo.limparInventario();
            alvo.setBloqueioCartas(999);
        }
        return `MAYHEM! Buraco Negro! Todas as cartas foram consumidas pela escuridão!`;
    }
}

/**
 * Desejo Supremo - Escolhe automaticamente: Ganha 50 HP se vida < 50%, senão causa 40 de dano
 */
export class DesejoSupremo implements IItem {
    nome = 'Desejo Supremo';
    descricao = 'Ganha 50 HP se vida baixa, senão causa 40 de dano direto.';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        // Escolhe automaticamente baseado na situação
        const vidaBaixa = usuario.vida < (usuario.vidaMaxima * 0.5);
        
        if (vidaBaixa) {
            usuario.curar(50);
            return `MAYHEM! Desejo Supremo! ${usuario.nome} desejou saúde e ganhou 50 HP!`;
        } else if (alvo) {
            alvo.receberDanoDireto(40);
            return `MAYHEM! Desejo Supremo! ${usuario.nome} desejou destruição! ${alvo.nome} sofreu 40 de dano!`;
        }
        // Fallback para cura se não houver alvo
        usuario.curar(50);
        return `MAYHEM! Desejo Supremo! ${usuario.nome} desejou saúde e ganhou 50 HP!`;
    }
}

/**
 * Inversão Temporal - O jogo volta para o estado de 3 turnos atrás (HP e cartas)
 * Flag estático para que a Arena saiba que deve reverter o tempo
 */
export class InversaoTemporal implements IItem {
    nome = 'Inversão Temporal';
    descricao = 'O jogo volta para o estado de 3 turnos atrás (HP e cartas).';
    raridade = Raridade.Mayhem;
    isMayhem = true;
    
    // Flag para a Arena verificar
    static foiUsada: boolean = false;

    usar(_usuario: Personagem): string {
        InversaoTemporal.foiUsada = true;
        return `MAYHEM! Inversão Temporal! O tempo está voltando 3 turnos!`;
    }
}

/**
 * O Estalo - Remove metade da vida de ambos os jogadores, remove metade das cartas
 */
export class OEstalo implements IItem {
    nome = 'O Estalo';
    descricao = 'Remove metade da vida de ambos e metade das cartas pela partida toda.';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        // Reduzir vida pela metade
        usuario.vida = Math.max(1, Math.floor(usuario.vida / 2));
        if (alvo) {
            alvo.vida = Math.max(1, Math.floor(alvo.vida / 2));
        }
        
        // Remover metade das cartas do usuário
        const cartasRemoverUsuario = Math.floor(usuario.inventario.length / 2);
        const inventarioUsuario = [...usuario.inventario];
        usuario.limparInventario();
        for (let i = 0; i < inventarioUsuario.length - cartasRemoverUsuario; i++) {
            try {
                usuario.adicionarItem(inventarioUsuario[i]);
            } catch {
                break;
            }
        }
        
        // Remover metade das cartas do alvo
        if (alvo) {
            const cartasRemoverAlvo = Math.floor(alvo.inventario.length / 2);
            const inventarioAlvo = [...alvo.inventario];
            alvo.limparInventario();
            for (let i = 0; i < inventarioAlvo.length - cartasRemoverAlvo; i++) {
                try {
                    alvo.adicionarItem(inventarioAlvo[i]);
                } catch {
                    break;
                }
            }
        }

        return `MAYHEM! O ESTALO! A realidade foi alterada! Metade de tudo foi removido!`;
    }
}

/**
 * Exodia - Vence a partida automaticamente
 */
export class Exodia implements IItem {
    nome = 'Exodia';
    descricao = 'Vence a partida automaticamente!';
    raridade = Raridade.SuperMayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (alvo) {
            alvo.vida = 0;
        }
        return `SUPER MAYHEM! EXODIA! ${usuario.nome} VENCEU AUTOMATICAMENTE!`;
    }
}
