import { Partie } from '@app/classes/partie/partie';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Joueur } from '@common/interface/joueur';
import { Vec2 } from '@common/interface/vec2';
import { ID_SIMILARITE, INDEX_MATRICE, INDEX_REGROUP } from '@common/valeurs-par-defaut';

export class TempsLimite extends Partie {
    private nomsJeuxJoues: string[];
    private joueurs: Joueur[];
    private nbrDiffsTrouvees: number;

    constructor(joueurs: Joueur[]) {
        super();
        this.joueurs = new Array();
        this.joueurs = joueurs;
        this.nomsJeuxJoues = new Array();
        this.tempsDeDepart = Date.now();
    }

    assignerJeu(jeu: InterfaceJeux, paireMatriceTableau: [number[], Vec2[][]]): void {
        this.jeu = jeu;
        this.matriceDifferences = paireMatriceTableau[INDEX_MATRICE];
        this.tableauRegroupements = paireMatriceTableau[INDEX_REGROUP];
    }

    obtenirRegroupementDiffRestantes(): Vec2[][] {
        return this.tableauRegroupements;
    }

    obtenirRegroupementDifferenceAvecCoord(coords: Vec2): Vec2[] {
        const idDifference = this.obtenirIdDifference(coords);
        if (idDifference !== ID_SIMILARITE) {
            const regroupementDiffTrouvee = this.tableauRegroupements[idDifference];
            this.nbrDiffsTrouvees += 1;
            this.nomsJeuxJoues.push(this.jeu.nom);
            return regroupementDiffTrouvee;
        }
        return null;
    }

    partieEstFinie(listeJeux?: InterfaceJeux[]): boolean {
        const aucunJoueurRestant: boolean = this.joueurs.length === 0;
        let partieGagnee: boolean;

        if (listeJeux) {
            for (const jeu of listeJeux) {
                const jeuDejaJoue = this.jeuDejaJoue(jeu.nom);
                if (!jeuDejaJoue) {
                    partieGagnee = false;
                    break;
                } else {
                    partieGagnee = true;
                }
            }
        }
        return partieGagnee || aucunJoueurRestant;
    }

    estMultijoueur(): boolean {
        return this.joueurs.length > 1;
    }

    abandon(joueurQuiAbandonne: Joueur): void {
        this.joueurs.forEach((joueurActuel: Joueur, indexJoueurActuel: number) => {
            if (joueurActuel.nom === joueurQuiAbandonne.nom) {
                this.joueurs.splice(indexJoueurActuel, 1);
            }
        });
    }

    obtenirProchainNomJeu(listeJeux: InterfaceJeux[]): string {
        let jeuGenere: InterfaceJeux;
        do {
            const idJeuGenere = Math.floor(Math.random() * listeJeux.length);
            jeuGenere = listeJeux[idJeuGenere];
        } while (this.jeuDejaJoue(jeuGenere.nom));
        return jeuGenere.nom;
    }

    obtenirJoueurGagnant(): Joueur {
        return null;
    }

    private jeuDejaJoue(nomJeu: string): boolean {
        return this.nomsJeuxJoues.find((nomJeuActuel: string) => nomJeuActuel === nomJeu) !== undefined;
    }
}
