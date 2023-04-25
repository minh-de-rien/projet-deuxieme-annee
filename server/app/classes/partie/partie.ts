import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { Vec2 } from '@common/interface/vec2';
import { BLANC, DECALAGE_ID_DIFFERENCE, INDEX_POSITION_ALPHA_PIXEL, LARGEUR_IMAGE, NOMBRE_DE_COULEURS_PAR_PIXEL } from '@common/valeurs-par-defaut';

export abstract class Partie {
    constantesDeTemps: ConstantesTempsJeux;
    protected idSalle: string;
    protected jeu: InterfaceJeux;
    protected matriceDifferences: number[];
    protected tableauRegroupements: Vec2[][];
    protected tempsDeDepart: number;

    obtenirTempsDeDepart(): number {
        return this.tempsDeDepart;
    }

    protected obtenirIdDifference(coords: Vec2): number {
        const index: number = (coords.y * LARGEUR_IMAGE + coords.x) * NOMBRE_DE_COULEURS_PAR_PIXEL;
        return BLANC - this.matriceDifferences[index + INDEX_POSITION_ALPHA_PIXEL] - DECALAGE_ID_DIFFERENCE;
    }

    abstract assignerJeu(jeu: InterfaceJeux, paireMatriceTableau: [number[], Vec2[][]]): void;

    abstract obtenirRegroupementDiffRestantes(): Vec2[][];
    abstract obtenirRegroupementDifferenceAvecCoord(coords: Vec2, joueur: Joueur): Vec2[];
    abstract partieEstFinie(listeJeux?: InterfaceJeux[]): boolean;
    abstract estMultijoueur(): boolean;
    abstract abandon(joueurQuiAbandonne: Joueur): void;
    abstract obtenirProchainNomJeu(listeJeux: InterfaceJeux[]): string;
    abstract obtenirJoueurGagnant(): Joueur;
}
