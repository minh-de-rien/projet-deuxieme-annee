export enum MessageConfigTemps {
    Titre = 'Ajuster les constantes de temps de tous les jeux',
    SousTitre = "Chaque jeu possède trois (3) temps qui sont configurables et qui s'appliquent à l'ensemble du système et à toutes les parties sauf celles déjà en cours.",

    TitreTempsCompteARebours = '1. Temps du compte à rebours',
    DescriptionTempsCompteARebours = 'En mode temps limité, un chronomètre initialisé par défaut à 30 secondes, décrémente à chaque seconde le temps que le joueur trouve une différence. Vous pouvez les ajuster selon le barème suivant: le temps minimal est de 5 secondes et le maximal est de 120 secondes.',

    TitreTempsPenalite = '2. Temps de pénalité pour l’utilisation d’un indice',
    DescriptionTempsPenalite = "À chaque fois qu'un joueur utilise un indice, un temps additionnel s'ajoute au compte à rebours. Vous pouvez l'ajuster selon le barème suivant: le temps de pénalité minimal est de 5 secondes et le maximal est de 30 secondes.",

    TitreTempsGain = '3. Temps gagné avec la découverte d’une différence',
    DescriptionTempsGain = "Lorsqu'une différence est trouvée par un joueur, quelques secondes sont enlevées du compte à rebours. Vous pouvez l'ajuster selon le barème suivant: le temps gagné minimal est de 5 secondes et le maximal est de 30 secondes.",
}
