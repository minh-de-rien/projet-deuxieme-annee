export class JoueurEnPartie {
    pointage: number;
    nom: string;
    id: string;
    estMonTour: boolean;

    constructor(nom: string, id: string) {
        this.nom = nom;
        this.id = id;
        this.estMonTour = false;
        this.pointage = 0;
    }
}
