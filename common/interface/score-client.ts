import { InterfaceScore } from './interface-score';

export interface ScoreClient {
    nomJeu: string;
    estSolo: boolean;
    nouveauScore: InterfaceScore;
}
