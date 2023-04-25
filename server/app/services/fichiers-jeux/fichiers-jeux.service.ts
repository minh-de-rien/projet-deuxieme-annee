import { ScoreService } from '@app/services/score/score.service';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { Vec2 } from '@common/interface/vec2';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FichiersJeuxService {
    constructor(private scoreService: ScoreService) {}
    obtenirJeux(): InterfaceJeux[] {
        const jeuxJSON = JSON.parse(fs.readFileSync('./assets/jeuxJSON.json').toString());
        return jeuxJSON.jeux;
    }
    async obtenirJeuxAvecScore(): Promise<InterfaceJeux[]> {
        const jeux: InterfaceJeux[] = this.obtenirJeux();
        if (await this.estSynchroAvecBD()) {
            await this.scoreService.attribuerScoreAChaqueJeuxPourLeClient(jeux);
        }
        return jeux;
    }

    obtenirJeu(id: number): InterfaceJeux {
        let jeuTrouve: InterfaceJeux = null;
        const listeJeux = this.obtenirJeux();
        listeJeux.forEach((jeuActuel) => {
            if (jeuActuel.id === id) {
                jeuTrouve = jeuActuel;
            }
        });
        return jeuTrouve;
    }

    obtenirJeuParNom(nom: string): InterfaceJeux {
        let jeuTrouve: InterfaceJeux = null;
        const listeJeux = this.obtenirJeux();
        jeuTrouve = listeJeux.find((jeuActuel) => {
            return jeuActuel.nom === nom;
        });
        return jeuTrouve;
    }

    async ajouterJeu(jeu: InterfaceJeux): Promise<void> {
        const listeJeux: InterfaceJeux[] = this.obtenirJeux();
        const lienMatrice = `./assets/matriceDifferences/${jeu.nom}.json`;
        const lienTableaux = `./assets/tableauxRegroupement/${jeu.nom}.json`;
        jeu.id = listeJeux.length;
        jeu.lienMatriceDifferences = lienMatrice;
        jeu.lienTableauRegroupement = lienTableaux;
        if (await this.estSynchroAvecBD()) {
            await this.scoreService.ajouterScore(jeu.nom);
        }
        this.enregistrerTableauEtMatriceJSON(jeu.nom, jeu.matriceDifferences, jeu.tableauRegroupements);
        jeu.matriceDifferences = null;
        jeu.tableauRegroupements = null;
        listeJeux.push(jeu);
        this.mettreAJourJeuxJSON(listeJeux);
    }

    mettreAJourJeuxJSON(listeJeux: InterfaceJeux[]): void {
        const jsonObject = { jeux: listeJeux };
        fs.writeFileSync('./assets/jeuxJSON.json', JSON.stringify(jsonObject));
    }

    mettreAJourJeuJSON(jeuModifie: InterfaceJeux): void {
        const listeJeux: InterfaceJeux[] = this.obtenirJeux();
        listeJeux.forEach((jeu: InterfaceJeux, index: number) => {
            if (jeu.id === jeuModifie.id) {
                listeJeux[index] = jeuModifie;
            }
        });
        this.mettreAJourJeuxJSON(listeJeux);
    }

    enregistrerTableauEtMatriceJSON(nomJeu: string, matriceDifferences: number[], tableauRegroupements: Vec2[][]): void {
        const matriceDiffString: string = JSON.stringify(matriceDifferences);
        const tableauRegroupString: string = JSON.stringify(tableauRegroupements);

        if (!fs.existsSync('./assets/matriceDifferences')) fs.mkdirSync('./assets/matriceDifferences');
        if (!fs.existsSync('./assets/tableauxRegroupement')) fs.mkdirSync('./assets/tableauxRegroupement');

        fs.writeFileSync(`./assets/matriceDifferences/${nomJeu}.json`, matriceDiffString);
        fs.writeFileSync(`./assets/tableauxRegroupement/${nomJeu}.json`, tableauRegroupString);
    }

    recupererTableauEtMatriceJSON(idJeu: number): [number[], Vec2[][]] {
        const jeu: InterfaceJeux = this.obtenirJeu(idJeu);
        const objetJsonMatriceDiff: Buffer = fs.readFileSync(jeu.lienMatriceDifferences);
        const objetJsonTableauRegroupement: Buffer = fs.readFileSync(jeu.lienTableauRegroupement);
        return [JSON.parse(objetJsonMatriceDiff.toString()), JSON.parse(objetJsonTableauRegroupement.toString())];
    }

    corrigerLesId(indexDeDepart: number, listeJeux: InterfaceJeux[]): void {
        for (let i = indexDeDepart; i < listeJeux.length; i++) {
            if (i !== listeJeux[i].id) {
                listeJeux[i].id = i;
            }
        }
    }

    async supprimerJeu(id: number): Promise<void> {
        try {
            const nomJeu = this.obtenirJeu(id).nom;
            const lienMatrice = `./assets/matriceDifferences/${nomJeu}.json`;
            const lienTableaux = `./assets/tableauxRegroupement/${nomJeu}.json`;

            if (fs.existsSync(lienMatrice))
                fs.unlink(lienMatrice, (err) => {
                    if (err) throw err;
                });

            if (fs.existsSync(lienTableaux))
                fs.unlink(lienTableaux, (err) => {
                    if (err) throw err;
                });

            if (await this.estSynchroAvecBD()) {
                await this.scoreService.supprimerScoreNomJeu(nomJeu);
            }
        } catch (error) {
            Logger.log('Erreur de suppression');
        }

        const listeJeux = this.obtenirJeux();
        listeJeux.splice(id, 1);
        this.corrigerLesId(id, listeJeux);
        this.mettreAJourJeuxJSON(listeJeux);
    }

    modifierEtatDuJeu(idJeu: number, idSalle: string = null): void {
        const jeu: InterfaceJeux = this.obtenirJeu(idJeu);
        jeu.aCree = !jeu.aCree;
        jeu.idSalle = idSalle;
        this.mettreAJourJeuJSON(jeu);
    }
    async supprimerTousLesJeux() {
        const lienMatrice = './assets/matriceDifferences/';
        const lienTableaux = './assets/tableauxRegroupement/';
        this.viderReportoire(lienMatrice);
        this.viderReportoire(lienTableaux);
        if (await this.estSynchroAvecBD()) await this.scoreService.supprimerTousLesScores();
        this.mettreAJourJeuxJSON([]);
    }
    async estSynchroAvecBD() {
        return true;
    }
    viderReportoire(chemin: string) {
        fs.readdir(chemin, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                Logger.log(file + ' : a ete supprime.');
                fs.unlinkSync(chemin + file);
            }
        });
    }
}
