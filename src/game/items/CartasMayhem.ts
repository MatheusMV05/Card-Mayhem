import { IItem } from '../interfaces';
import { Raridade } from '../enums';
import { Personagem } from '../entities/Personagem';

/**
 * Moeda do Apocalipse - Ambos os jogadores ficam com 1 de HP e rola uma moeda para ver de quem será o próximo turno
 */
export class MoedaDoApocalipse implements IItem {
    nome = 'Moeda do Apocalipse';
    descricao = 'Ambos os jogadores ficam com 1 de HP. Rola moeda para próximo turno.';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        usuario.vida = 1;
        if (alvo) {
            alvo.vida = 1;
        }
        const proximo = Math.random() < 0.5 ? usuario.nome : alvo?.nome || 'oponente';
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
 * Desejo Supremo - Escolha: Ganhe 50 de HP ou cause 40 de dano direto
 */
export class DesejoSupremo implements IItem {
    nome = 'Desejo Supremo';
    descricao = 'Escolha: Ganhe 50 de HP ou cause 40 de dano direto.';
    raridade = Raridade.Mayhem;
    isMayhem = true;
    private escolhaCura: boolean = true; // Default para cura, UI deve permitir escolha

    setEscolha(cura: boolean): void {
        this.escolhaCura = cura;
    }

    usar(usuario: Personagem, alvo?: Personagem): string {
        if (this.escolhaCura) {
            usuario.curar(50);
            return `MAYHEM! Desejo Supremo! ${usuario.nome} desejou saúde e ganhou 50 HP!`;
        } else if (alvo) {
            alvo.receberDanoDireto(40);
            return `MAYHEM! Desejo Supremo! ${usuario.nome} desejou destruição! ${alvo.nome} sofreu 40 de dano!`;
        }
        return `MAYHEM! Desejo Supremo! ${usuario.nome} fez um desejo!`;
    }
}

/**
 * Inversão Temporal - O jogo volta para o estado de 3 turnos atrás (HP e cartas)
 */
export class InversaoTemporal implements IItem {
    nome = 'Inversão Temporal';
    descricao = 'O jogo volta para o estado de 3 turnos atrás (HP e cartas).';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(_usuario: Personagem): string {
        // Efeito implementado na lógica de batalha (Arena)
        return `MAYHEM! Inversão Temporal! O tempo está voltando 3 turnos!`;
    }
}

/**
 * O Estalo - Remove metade da vida de ambos os jogadores, remove 1 ataque e metade das cartas
 */
export class OEstalo implements IItem {
    nome = 'O Estalo';
    descricao = 'Remove metade da vida de ambos, 1 ataque e metade das cartas pela partida toda.';
    raridade = Raridade.Mayhem;
    isMayhem = true;

    usar(usuario: Personagem, alvo?: Personagem): string {
        // Reduzir vida pela metade
        usuario.vida = Math.floor(usuario.vida / 2);
        if (alvo) {
            alvo.vida = Math.floor(alvo.vida / 2);
        }
        
        // Remover metade das cartas
        const cartasUsuario = Math.floor(usuario.inventario.length / 2);
        for (let i = 0; i < cartasUsuario; i++) {
            usuario.limparInventario();
        }
        
        // Bloquear uso de cartas parcialmente
        usuario.setBloqueioCartas(999);
        if (alvo) {
            alvo.setBloqueioCartas(999);
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
