import { IItem } from '../interfaces';
import { Raridade, RaridadeChance } from '../enums';

// Importar todas as cartas
import { PocaoVida, PocaoMana } from './Pocoes';
import { PedraDeAmolar, ErvaAmarga, PergaminhoDeVisao, BandagemSimples, AmuletoDebarro, FrascoDeOleo } from './CartasComuns';
import { ElixirDeFerro, CajadoQuebrado, MantoDeSombras, OrbeDeCristal, EssenciaDeSangue, EscudoEspinhoso } from './CartasRaras';
import { LivroDeFeiticosProibidos, ReliquiaSagrada, AnkhDaReencarnacao, CoroaDeEspinhos, CetroDeDominacao } from './CartasEpicas';
import { CáliceDoInfinito, EspadaExcalibur, GrimórioDelich, OlhoDeSauron, CapaDeInvisibilidade, MarteloDeThor, PedraFilosofal } from './CartasLendarias';
import { MoedaDoApocalipse, BuracoNegro, DesejoSupremo, InversaoTemporal, OEstalo, Exodia } from './CartasMayhem';

/**
 * Fábrica de cartas - cria instâncias de cartas baseado na raridade
 */
export class CardFactory {
    // Cartas por raridade
    private static cartasComuns = [
        () => new PocaoVida(),
        () => new PocaoMana(),
        () => new PedraDeAmolar(),
        () => new ErvaAmarga(),
        () => new PergaminhoDeVisao(),
        () => new BandagemSimples(),
        () => new AmuletoDebarro(),
        () => new FrascoDeOleo()
    ];

    private static cartasRaras = [
        () => new ElixirDeFerro(),
        () => new CajadoQuebrado(),
        () => new MantoDeSombras(),
        () => new OrbeDeCristal(),
        () => new EssenciaDeSangue(),
        () => new EscudoEspinhoso()
    ];

    private static cartasEpicas = [
        () => new LivroDeFeiticosProibidos(),
        () => new ReliquiaSagrada(),
        () => new AnkhDaReencarnacao(),
        () => new CoroaDeEspinhos(),
        () => new CetroDeDominacao()
    ];

    private static cartasLendarias = [
        () => new CáliceDoInfinito(),
        () => new EspadaExcalibur(),
        () => new GrimórioDelich(),
        () => new OlhoDeSauron(),
        () => new CapaDeInvisibilidade(),
        () => new MarteloDeThor(),
        () => new PedraFilosofal()
    ];

    private static cartasMayhem = [
        () => new MoedaDoApocalipse(),
        () => new BuracoNegro(),
        () => new DesejoSupremo(),
        () => new InversaoTemporal(),
        () => new OEstalo()
    ];

    private static cartasSuperMayhem = [
        () => new Exodia()
    ];

    /**
     * Sorteia uma raridade baseado nas chances definidas
     */
    static sortearRaridade(): Raridade {
        const rand = Math.random() * 100;
        
        // Super Mayhem (1%)
        if (rand < RaridadeChance[Raridade.SuperMayhem]) {
            return Raridade.SuperMayhem;
        }
        
        // Mayhem (4%)
        if (rand < RaridadeChance[Raridade.Mayhem]) {
            return Raridade.Mayhem;
        }
        
        // Lendária (20%)
        if (rand < RaridadeChance[Raridade.Lendario]) {
            return Raridade.Lendario;
        }
        
        // Épica (30%)
        if (rand < RaridadeChance[Raridade.Epico]) {
            return Raridade.Epico;
        }
        
        // Rara (50%)
        if (rand < RaridadeChance[Raridade.Raro]) {
            return Raridade.Raro;
        }
        
        // Comum (70% - default)
        return Raridade.Comum;
    }

    /**
     * Cria uma carta aleatória da raridade especificada
     */
    static criarCartaPorRaridade(raridade: Raridade): IItem {
        let pool: (() => IItem)[];
        
        switch (raridade) {
            case Raridade.SuperMayhem:
                pool = this.cartasSuperMayhem;
                break;
            case Raridade.Mayhem:
                pool = this.cartasMayhem;
                break;
            case Raridade.Lendario:
                pool = this.cartasLendarias;
                break;
            case Raridade.Epico:
                pool = this.cartasEpicas;
                break;
            case Raridade.Raro:
                pool = this.cartasRaras;
                break;
            default:
                pool = this.cartasComuns;
        }
        
        const indice = Math.floor(Math.random() * pool.length);
        return pool[indice]();
    }

    /**
     * Cria uma carta aleatória com raridade sorteada
     */
    static criarCartaAleatoria(): IItem {
        const raridade = this.sortearRaridade();
        return this.criarCartaPorRaridade(raridade);
    }

    /**
     * Cria múltiplas cartas aleatórias
     */
    static criarCartas(quantidade: number): IItem[] {
        const cartas: IItem[] = [];
        for (let i = 0; i < quantidade; i++) {
            cartas.push(this.criarCartaAleatoria());
        }
        return cartas;
    }

    /**
     * Cria cartas épicas (para Ankh da Reencarnação)
     */
    static criarCartasEpicas(quantidade: number): IItem[] {
        const cartas: IItem[] = [];
        for (let i = 0; i < quantidade; i++) {
            cartas.push(this.criarCartaPorRaridade(Raridade.Epico));
        }
        return cartas;
    }

    /**
     * Cria uma carta Mayhem aleatória (para Pedra Filosofal)
     */
    static criarCartaMayhem(): IItem {
        return this.criarCartaPorRaridade(Raridade.Mayhem);
    }
}
