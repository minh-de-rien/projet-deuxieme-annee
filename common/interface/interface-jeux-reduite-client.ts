import { InterfaceScore } from './interface-score';

export interface InterfaceJeuxReduiteClient {
    id: number;
    nom: string;
    aCree?: boolean;
    idSalle?: string;
    meilleursTempsSolo?: InterfaceScore[];
    meilleursTemps1v1?: InterfaceScore[];
    imgOriginale: string;
    imgModifiee: string;
    nombreDifferences: number;
}
