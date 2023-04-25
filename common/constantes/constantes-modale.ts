import { MessageModale } from '@common/enum/message-modale';
import { ModaleConfig } from '@common/interface/configuration-modale';

export const DONNEE_MODALE_SUPPRIMER: ModaleConfig = {
    nom: MessageModale.NomSupprimer,
    titre: MessageModale.TitreSupprimer,
    description: MessageModale.DescriptionSupprimer,
    boutonActionTexte: MessageModale.BoutonActionTexteSupprimer,
    necessiteBoutonRetour: true,
};

export const DONNEE_MODALE_REINITIALISER: ModaleConfig = {
    nom: MessageModale.NomReinitialiserMeilleursTemps,
    titre: MessageModale.TitreReinitialiserMeilleursTemps,
    description: MessageModale.DescriptionReinitialiserMeilleursTemps,
    boutonActionTexte: MessageModale.BoutonActionTexteReinitialiser,
    necessiteBoutonRetour: true,
};
