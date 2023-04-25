import { Salle } from '@app/classes/salle/salle';
import { ModesJeu, NOM_SALLE_SOCKET_SERVEUR } from '@common/valeurs-par-defaut';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GestionSallesService {
    private listeDesSalles: Map<string, Salle> = new Map<string, Salle>();
    private numeroDeSalle: number = 0;

    creerSalle(modeDeJeu: ModesJeu): string {
        const nomNouvelleSalle: string = this.genererNomNouvelleSalle();
        const nouvelleSalle: Salle = new Salle(nomNouvelleSalle, modeDeJeu);
        this.listeDesSalles.set(nomNouvelleSalle, nouvelleSalle);
        return nomNouvelleSalle;
    }

    obtenirSalle(salleId: string): Salle {
        return this.listeDesSalles.get(salleId);
    }

    obtenirIdSalleDuSocket(socket: Socket): string {
        let idSalleTrouvee: string;
        socket.rooms.forEach((idSalleSocket: string) => {
            if (this.listeDesSalles.has(idSalleSocket)) {
                idSalleTrouvee = idSalleSocket;
            }
        });

        if (!idSalleTrouvee) {
            for (const [idSalleActuelle, salleActuelle] of this.listeDesSalles) {
                if (salleActuelle.trouverJoueurAssocieSocket(socket)) {
                    idSalleTrouvee = idSalleActuelle;
                }
            }
        }
        return idSalleTrouvee;
    }

    obtenirSalleAvecSocket(socket: Socket): Salle {
        const idSalle: string = this.obtenirIdSalleDuSocket(socket);
        return this.obtenirSalle(idSalle);
    }

    obtenirSallesDuJeu(idJeu: number): Salle[] {
        const sallesDuJeu: Salle[] = new Array();
        this.listeDesSalles.forEach((salle: Salle) => {
            if (salle.obtenirIdJeu() === idJeu) {
                sallesDuJeu.push(salle);
            }
        });
        return sallesDuJeu;
    }

    obtenirSalleTempsLimiteDisponible(): string {
        let idSalleTrouvee: string;
        this.listeDesSalles.forEach((salle: Salle) => {
            if (salle.estEnAttenteTempsLimite()) {
                idSalleTrouvee = salle.obtenirIdSalle();
                return;
            }
        });
        return idSalleTrouvee;
    }

    supprimerSalle(idSalle: string): void {
        this.listeDesSalles.get(idSalle).retirerTousLesJoueurs();
        this.listeDesSalles.delete(idSalle);
    }

    private genererNomNouvelleSalle(): string {
        this.numeroDeSalle++;
        return NOM_SALLE_SOCKET_SERVEUR + this.numeroDeSalle.toString();
    }
}
