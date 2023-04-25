import { Vec2 } from './vec2'; // Vec2 = {x, y}

export interface InterfaceMatriceDifference {
    nom: string;
    tableauRegroupements?: Vec2[][];
    matriceDifferences: Uint8ClampedArray;
}
