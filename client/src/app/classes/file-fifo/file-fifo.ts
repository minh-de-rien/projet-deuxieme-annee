import { Vec2 } from '@common/interface/vec2';

export class FileFIFO {
    private elements: Vec2[] = [];

    ajouterEnFile(elem: Vec2): void {
        this.elements.push(elem);
    }

    retirerDeFile(): Vec2 {
        const valeurRetiree = this.elements.shift();
        if (valeurRetiree) {
            return valeurRetiree;
        }

        return { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER };
    }

    longueur(): number {
        return this.elements.length;
    }

    contient(argument: Vec2): boolean {
        let valeurTrouvee = false;
        this.elements.forEach((element) => {
            if (element.x === argument.x && element.y === argument.y) {
                valeurTrouvee = true;
            }
        });
        return valeurTrouvee;
    }
}
