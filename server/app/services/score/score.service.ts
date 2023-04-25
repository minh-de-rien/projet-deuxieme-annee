/* eslint-disable no-underscore-dangle */
import { Score, ScoreDocument } from '@app/modele/base-de-donnes/score';
import { CreationScoreDto } from '@app/modele/dto/creation-score.dto';
import { ModificationScoreDto } from '@app/modele/dto/modification-score.dto';
import { InterfaceJeux } from '@common/interface/interface-jeux';
import { InterfaceScore } from '@common/interface/interface-score';
import { reponseDeclassementScore } from '@common/interface/reponse-declassement-score';
import { ScoreClient } from '@common/interface/score-client';
import {
    MEILLEURS_TEMPS_PAR_DEFAUT,
    NOMBRE_MEILLEURS_SCORES_PAR_JEU,
    NOMS_MEILLEURS_TEMPS_PAR_DEFAUT,
    PAS_DE_RECHERCHE_MEILLEUR_TEMPS,
} from '@common/valeurs-par-defaut';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ScoreService {
    constructor(@InjectModel(Score.name) public modeleScore: Model<ScoreDocument>, private readonly logger: Logger) {}

    async ajouterScore(nomJeu: string): Promise<void> {
        try {
            const [meilleursTemps1v1, meilleursTempsSolo] = this.genererMeilleursScore();
            const score = new CreationScoreDto();
            score.nomJeu = nomJeu;
            score.meilleursTemps1v1 = meilleursTemps1v1;
            score.meilleursTempsSolo = meilleursTempsSolo;

            await this.modeleScore.create(score);
        } catch (error) {
            return Promise.reject(`Echec de d'ajout d'un nouveau score: ${error}`);
        }
    }

    async supprimerScoreNomJeu(nomJeu: string): Promise<void> {
        try {
            const res = await this.modeleScore.deleteOne({
                nomJeu,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Pas pu trouver le score');
            }
        } catch (error) {
            return Promise.reject(`Echec de suppression du score: ${error}`);
        }
    }

    async supprimerTousLesScores(): Promise<void> {
        try {
            await this.modeleScore.deleteMany({});
        } catch (error) {
            return Promise.reject(`Echec de suppression des scores: ${error}`);
        }
    }

    async modifierScore(scoreDto: ModificationScoreDto): Promise<void> {
        try {
            const score = await this.obtenirScoreParNomJeu(scoreDto.nomJeu);
            const filterQuery = { _id: score._id };
            const res = await this.modeleScore.updateOne(filterQuery, scoreDto);
            if (res.matchedCount === 0) {
                return Promise.reject('Pas pu trouver le jeu');
            }
        } catch (error) {
            return Promise.reject(`Echec de modification du score: ${error}`);
        }
    }

    async reinitialiserScore(nomJeu: string) {
        const [meilleursTemps1v1, meilleursTempsSolo] = this.genererMeilleursScore();
        const score = new ModificationScoreDto();
        score.nomJeu = nomJeu;
        score.meilleursTemps1v1 = meilleursTemps1v1;
        score.meilleursTempsSolo = meilleursTempsSolo;

        await this.modifierScore(score);
    }
    async reinitialiserTousLesScores() {
        const scores = await this.obtenirTousLesScores();
        for (const score of scores) await this.reinitialiserScore(score.nomJeu);
    }

    async obtenirScoreParNomJeu(nomJeu: string): Promise<Score> {
        const filterQuery: FilterQuery<Score> = { nomJeu };
        return await this.modeleScore.findOne(filterQuery);
    }

    async obtenirTousLesScores(): Promise<Score[]> {
        return await this.modeleScore.find({});
    }

    async verificationDeclassementScore(scoreClient: ScoreClient): Promise<reponseDeclassementScore> {
        const score = await this.obtenirScoreParNomJeu(scoreClient.nomJeu);
        if (score) {
            let reponseDeclassement: reponseDeclassementScore;
            if (scoreClient.estSolo) {
                reponseDeclassement = this.modifierTableauMeilleursScores(scoreClient.nouveauScore, score.meilleursTempsSolo);
            } else {
                reponseDeclassement = this.modifierTableauMeilleursScores(scoreClient.nouveauScore, score.meilleursTemps1v1);
            }
            await this.modifierScore(score);
            return reponseDeclassement;
        } else {
            return { aDeclasse: false, index: -1 };
        }
    }
    async attribuerScoreAChaqueJeuxPourLeClient(jeux: InterfaceJeux[]): Promise<boolean> {
        try {
            const scores = await this.obtenirTousLesScores();
            for (const jeu of jeux) {
                const scoreJeu: Score = scores.find((score) => score.nomJeu === jeu.nom);
                if (scoreJeu) {
                    jeu.meilleursTemps1v1 = scoreJeu.meilleursTemps1v1;
                    jeu.meilleursTempsSolo = scoreJeu.meilleursTempsSolo;
                }
            }
            return true;
        } catch (err) {
            this.logger.log(err);
            return false;
        }
    }
    private modifierTableauMeilleursScores(nouveauScore: InterfaceScore, scores: InterfaceScore[]): reponseDeclassementScore {
        scores.push(nouveauScore);
        scores.sort((a, b) => a.temps - b.temps);
        return this.aModifierScore(scores, nouveauScore, scores.pop());
    }

    private aModifierScore(scores: InterfaceScore[], nouveauScore: InterfaceScore, scoreSupprime: InterfaceScore): reponseDeclassementScore {
        if (nouveauScore.nomJoueur === scoreSupprime.nomJoueur && nouveauScore.temps === scoreSupprime.temps) return { aDeclasse: false, index: -1 };
        else return { aDeclasse: true, index: scores.findIndex((a) => a.temps === nouveauScore.temps) + 1 };
    }

    private genererMeilleursScore(): InterfaceScore[][] {
        const meilleursTemps1v1: InterfaceScore[] = [];
        const meilleursTempsSolo: InterfaceScore[] = [];
        const setNoms = new Set<string>();
        const setTemps = new Set<number>();

        const indice = this.genereValeurAlertoire(0, NOMS_MEILLEURS_TEMPS_PAR_DEFAUT.length);
        for (let i = 0, position = 0; ; i++) {
            position =
                (indice + i * PAS_DE_RECHERCHE_MEILLEUR_TEMPS) % Math.min(NOMS_MEILLEURS_TEMPS_PAR_DEFAUT.length, MEILLEURS_TEMPS_PAR_DEFAUT.length);
            setNoms.add(NOMS_MEILLEURS_TEMPS_PAR_DEFAUT[position]);
            setTemps.add(MEILLEURS_TEMPS_PAR_DEFAUT[position]);
            if (setNoms.size >= NOMBRE_MEILLEURS_SCORES_PAR_JEU * 2 && setTemps.size >= NOMBRE_MEILLEURS_SCORES_PAR_JEU * 2) break;
        }
        const tabNoms = [...setNoms];
        const tabTemps = [...setTemps];
        for (let i = 0; i < NOMBRE_MEILLEURS_SCORES_PAR_JEU * 2; i++) {
            if (i < NOMBRE_MEILLEURS_SCORES_PAR_JEU) meilleursTemps1v1.push({ nomJoueur: tabNoms[i], temps: tabTemps[i] });
            else meilleursTempsSolo.push({ nomJoueur: tabNoms[i], temps: tabTemps[i] });
        }

        meilleursTemps1v1.sort((a, b) => a.temps - b.temps);
        meilleursTempsSolo.sort((a, b) => a.temps - b.temps);

        return [meilleursTemps1v1, meilleursTempsSolo];
    }

    private genereValeurAlertoire(debut: number, fin: number) {
        return Math.floor(debut + Math.random() * fin);
    }
}
