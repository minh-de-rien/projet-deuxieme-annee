import { Partie } from '@app/classes/partie/partie';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { Vec2 } from '@common/interface/vec2';
import { ID_SIMILARITE, INDEX_JOUEUR_HOTE, INDEX_MATRICE, INDEX_REGROUP } from '@common/valeurs-par-defaut';

export class Classique extends Partie {
    private joueurs: Joueur[];
    private regroupementsDiffsRestantes: Map<number, Vec2[]>;
    private nbrDiffTrouveesJoueurs: Map<string, number>;
    private joueurGagnant: Joueur;

    constructor(joueurs: Joueur[]) {
        super();
        this.idSalle = joueurs[INDEX_JOUEUR_HOTE].idSalle;
        this.joueurs = joueurs;
        this.regroupementsDiffsRestantes = new Map<number, Vec2[]>();

        this.nbrDiffTrouveesJoueurs = new Map<string, number>();
        joueurs.forEach((joueur: Joueur) => {
            this.nbrDiffTrouveesJoueurs.set(joueur.nom, 0);
        });
        this.tempsDeDepart = Date.now();
    }

    assignerJeu(jeu: InterfaceJeux, paireMatriceTableau: [number[], Vec2[][]]): void {
        this.jeu = jeu;
        this.matriceDifferences = paireMatriceTableau[INDEX_MATRICE];
        this.tableauRegroupements = paireMatriceTableau[INDEX_REGROUP];
        this.tableauRegroupements.forEach((regroupement: Vec2[], index: number) => {
            this.regroupementsDiffsRestantes.set(index, regroupement);
        });
    }

    obtenirRegroupementDiffRestantes(): Vec2[][] {
        return Array.from(this.regroupementsDiffsRestantes.values());
    }

    obtenirRegroupementDifferenceAvecCoord(coords: Vec2, joueur: Joueur): Vec2[] {
        const idDifference = this.obtenirIdDifference(coords);
        if (idDifference !== ID_SIMILARITE && !this.diffDejaTrouvee(idDifference)) {
            const regroupementDiffTrouvee = this.tableauRegroupements[idDifference];
            this.regroupementsDiffsRestantes.delete(idDifference);
            this.incrementerDiffsTrouveesJoueur(joueur);
            return regroupementDiffTrouvee;
        }
        return null;
    }

    partieEstFinie(): boolean {
        const pasAssezDeJoueurs: boolean = !this.estMultijoueur() && !this.joueurs[INDEX_JOUEUR_HOTE].estSolo;

        let estGagnee: boolean;
        for (const [nomJoueurActuel, nbrDiffsTrouveesJoueurActuel] of this.nbrDiffTrouveesJoueurs) {
            estGagnee = this.estMultijoueur()
                ? nbrDiffsTrouveesJoueurActuel >= Math.ceil(this.tableauRegroupements.length / 2)
                : nbrDiffsTrouveesJoueurActuel === this.tableauRegroupements.length;

            if (estGagnee) {
                this.joueurGagnant = this.obtenirJoueurAvecNom(nomJoueurActuel);
                break;
            }
        }
        return pasAssezDeJoueurs || estGagnee;
    }

    estMultijoueur(): boolean {
        return this.nbrDiffTrouveesJoueurs.size > 1;
    }

    abandon(joueurQuiAbandonne: Joueur): void {
        this.nbrDiffTrouveesJoueurs.delete(joueurQuiAbandonne.nom);
        this.nbrDiffTrouveesJoueurs.forEach((_: number, nomJoueur: string) => {
            this.joueurGagnant = this.obtenirJoueurAvecNom(nomJoueur);
        });
    }

    obtenirProchainNomJeu(): string {
        return null;
    }

    obtenirJoueurGagnant(): Joueur {
        return this.joueurGagnant;
    }

    private obtenirJoueurAvecNom(nomJoueur: string): Joueur {
        let joueurTrouve: Joueur;
        for (const joueurActuel of this.joueurs) {
            if (joueurActuel.nom === nomJoueur) joueurTrouve = joueurActuel;
        }
        return joueurTrouve;
    }

    private incrementerDiffsTrouveesJoueur(joueur: Joueur): void {
        this.nbrDiffTrouveesJoueurs.set(joueur.nom, this.nbrDiffTrouveesJoueurs.get(joueur.nom) + 1);
    }

    private diffDejaTrouvee(idDifference: number): boolean {
        return !this.regroupementsDiffsRestantes.has(idDifference);
    }
}
