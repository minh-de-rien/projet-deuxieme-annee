import { Classique } from '@app/classes/partie/classique/classique';
import { Partie } from '@app/classes/partie/partie';
import { TempsLimite } from '@app/classes/partie/temps-limite/temps-limite';
import { Joueur } from '@common/interface/joueur';
import { INDEX_JOUEUR_HOTE, ModesJeu } from '@common/valeurs-par-defaut';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GestionPartiesCourantes {
    private partiesEnCours: Map<string, Partie> = new Map<string, Partie>();

    ajouterUnePartie(joueurs: Joueur[], modeDeJeu: ModesJeu): Partie {
        let nouvellePartie: Partie;
        if (modeDeJeu === ModesJeu.Classique) nouvellePartie = new Classique(joueurs);
        else if (modeDeJeu === ModesJeu.TempsLimite) nouvellePartie = new TempsLimite(joueurs);
        this.partiesEnCours.set(joueurs[INDEX_JOUEUR_HOTE].idSalle, nouvellePartie);
        return nouvellePartie;
    }

    supprimerPartie(salleId: string): void {
        this.partiesEnCours.delete(salleId);
    }

    obtenirPartie(salleId: string): Partie {
        return this.partiesEnCours.get(salleId);
    }
}
