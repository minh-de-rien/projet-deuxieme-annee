import { InterfaceScore } from './interface-score';
import { Vec2 } from './vec2';

export interface InterfaceJeux {
    id: number;
    nom: string;
    aCree?: boolean;
    idSalle?: string;
    meilleursTempsSolo?: InterfaceScore[];
    meilleursTemps1v1?: InterfaceScore[];
    imgOriginale: string;
    imgModifiee: string;
    nombreDifferences: number;
    lienTableauRegroupement?: string;
    lienMatriceDifferences?: string;
    tableauRegroupements?: Vec2[][];
    matriceDifferences?: number[];
}
