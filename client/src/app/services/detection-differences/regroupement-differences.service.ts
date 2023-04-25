import { Injectable } from '@angular/core';
import { FileFIFO } from '@app/classes/file-fifo/file-fifo';
import { Vec2 } from '@common/interface/vec2';
import { BLANC, INDEX_POSITION_ALPHA_PIXEL, NOMBRE_DE_COULEURS_PAR_PIXEL, VALEUR_ALPHA_NON_VISITEE } from '@common/valeurs-par-defaut';

@Injectable({
    providedIn: 'root',
})
export class RegroupementDifferencesService {
    private fileFIFO: FileFIFO = new FileFIFO();
    private idDifference: number = 0;
    private tableauCoordRegroupees: Vec2[] = [];
    private matriceDeDifferencesElargie: Uint8ClampedArray;
    private listeDesCoordonneesDiff: Vec2[];
    private mapDifferencesRegroupees: Map<number, Vec2[]> = new Map<number, Vec2[]>();
    private largeurImage: number;
    private hauteurImage: number;
    initialisation(matriceDeDifferencesElargie: Uint8ClampedArray, listeDesCoordonneesDiff: Vec2[], img: ImageData) {
        this.matriceDeDifferencesElargie = matriceDeDifferencesElargie;
        this.listeDesCoordonneesDiff = listeDesCoordonneesDiff;
        this.largeurImage = img.width;
        this.hauteurImage = img.height;
    }

    regrouperLesDifferences() {
        this.idDifference = 0;
        this.listeDesCoordonneesDiff.forEach((coordActuelle) => {
            if (!this.aEteVisitee(coordActuelle)) {
                this.idDifference++;
                this.bfs(coordActuelle);
            }
            this.tableauCoordRegroupees = [];
        });
    }

    obtenirImgDeDifferences(): ImageData {
        const imgData = new ImageData(this.matriceDeDifferencesElargie, this.largeurImage, this.hauteurImage);
        return imgData;
    }

    obtenirNombreDifferences(): number {
        return this.mapDifferencesRegroupees.size;
    }

    obtenirMapDifferences(): Map<number, Vec2[]> {
        return this.mapDifferencesRegroupees;
    }

    reinitialiserMapDifferences() {
        this.mapDifferencesRegroupees.clear();
    }

    private aEteVisitee(coord: Vec2): boolean {
        const valeurAlphaPixel = this.matriceDeDifferencesElargie[this.transformerCoordEnIndex(coord) + INDEX_POSITION_ALPHA_PIXEL];
        return valeurAlphaPixel !== VALEUR_ALPHA_NON_VISITEE;
    }

    private transformerCoordEnIndex(coord: Vec2): number {
        return NOMBRE_DE_COULEURS_PAR_PIXEL * (this.largeurImage * coord.y + coord.x);
    }

    private bfs(coordDeDepart: Vec2) {
        let coordActuelle: Vec2 = { x: coordDeDepart.x, y: coordDeDepart.y };
        this.fileFIFO.ajouterEnFile(coordActuelle);
        let x = 0;
        let y = 0;

        do {
            coordActuelle = this.fileFIFO.retirerDeFile();
            x = coordActuelle.x;
            y = coordActuelle.y;
            this.visiterCoord(coordActuelle);

            const voisinGauche: Vec2 = { x: x - 1, y };
            const voisinDroite: Vec2 = { x: x + 1, y };
            const voisinHaut: Vec2 = { x, y: y - 1 };
            const voisinBas: Vec2 = { x, y: y + 1 };

            if (this.estVisitable(voisinGauche)) {
                this.fileFIFO.ajouterEnFile(voisinGauche);
            }
            if (this.estVisitable(voisinDroite)) {
                this.fileFIFO.ajouterEnFile(voisinDroite);
            }
            if (this.estVisitable(voisinHaut)) {
                this.fileFIFO.ajouterEnFile(voisinHaut);
            }
            if (this.estVisitable(voisinBas)) {
                this.fileFIFO.ajouterEnFile(voisinBas);
            }
        } while (this.fileFIFO.longueur() > 0);
    }

    private visiterCoord(coord: Vec2 | undefined) {
        if (coord) {
            this.tableauCoordRegroupees.push(coord);
            this.mapDifferencesRegroupees.set(this.idDifference, this.tableauCoordRegroupees);
            this.matriceDeDifferencesElargie[this.transformerCoordEnIndex(coord) + INDEX_POSITION_ALPHA_PIXEL] = BLANC - this.idDifference;
        }
    }

    private estVisitable(coord: Vec2): boolean {
        return this.estDansLesDimensions(coord) && !this.aEteVisitee(coord) && !this.fileFIFO.contient(coord);
    }

    private estDansLesDimensions(coord: Vec2): boolean {
        return coord.x >= 0 && coord.x < this.largeurImage && coord.y >= 0 && coord.y < this.hauteurImage;
    }
}
