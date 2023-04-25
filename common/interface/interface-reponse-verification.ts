import { Vec2 } from './vec2';
export interface InterfaceReponseVerification {
    difference: Vec2[] | null;
    indexJoueur: number;
    partieEstFinie: boolean;
}
