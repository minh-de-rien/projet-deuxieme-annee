import { TEMPS_JEUX_PAR_DEFAUT } from '@common/constantes/constantes-temps-jeux';
import { ConstantesTempsJeux } from '@common/interface/constantes-temps-jeux';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GestionConstantesTempsJeuxService {
    private objetJson = {};

    mettreAJourConstantesTempsJeux(tempsJeux: ConstantesTempsJeux): void {
        this.creerObjetJson(tempsJeux);
        this.ecrireDansConstantesTempsJeuxJson();
    }

    obtenirConstantesTempsJeux(): ConstantesTempsJeux {
        const tempsJeuxJson = JSON.parse(fs.readFileSync('./assets/constantesTempsJeux.json').toString());
        return tempsJeuxJson.constantesTempsJeux;
    }

    reinitialiserConstantesTempsJeux(): void {
        this.creerObjetJson(TEMPS_JEUX_PAR_DEFAUT);
        this.ecrireDansConstantesTempsJeuxJson();
    }

    private ecrireDansConstantesTempsJeuxJson(): void {
        fs.writeFileSync('./assets/constantesTempsJeux.json', JSON.stringify(this.objetJson));
    }

    private creerObjetJson(tempsJeux: ConstantesTempsJeux) {
        this.objetJson = { constantesTempsJeux: tempsJeux };
    }
}
