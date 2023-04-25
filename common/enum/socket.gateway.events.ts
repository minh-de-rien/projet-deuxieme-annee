export enum SocketEvenements {
    RejoindreSalle = 'rejoindreSalle',
    CreerSalle = 'creerSalle',

    SalleEstPleine = 'salleEstPleine',
    SalleId = 'salleId',

    DemandeJoindrePartie = 'demandeJoindrePartie',
    LancerPartie = 'lancerPartie',

    QuitterSalle = 'quitterSalle',
    RejeteDeLaSalle = 'rejeteDeLaSalle',
    RetirerInviteDeLaSalle = 'retirerInviteDeLaSalle',

    MiseAJourConstantesTempsJeux = 'constantesTemps',
    EnvoiConstantesTempsJeux = 'envoiConstantesTempsJeux',
    DemandeConstantesTempsJeux = 'demandeConstantesTempsJeux',
    ReinitialisationConstantesTempsJeux = 'reinitialisationConstantesTempsJeux',

    Jeux = 'jeux',
    ChargerNouveauxJeux = 'chargerNouveauxJeux',
    RecupererListeJeux = 'recupererListeJeux',

    VerificationCoord = 'verificationCoord',
    ReponseVerificationCoord = 'reponseVerificationCoord',

    AccepterInvite = 'accepterInvite',
    RejeterInvite = 'rejeterInvite',

    HoteAQuitteSalle = 'hoteAQuitteSalle',
    InviteAQuitteSalle = 'inviteAQuitteSalle',

    AnnonceSuppressionSalle = 'annonceSuppressionSalle',
    AnnonceSuppressionJeu = 'annonceSuppressionJeu',
    AnnonceSuppressionTousLesJeux = 'annonceSuppressionTousLesJeux',

    AnnonceReinitialisationScore = 'annonceReinitialisationScore',
    AnnonceReinitialisationTousLesScores = 'annonceReinitialisationTousLesScores',

    NouveauScore = 'nouveauScore',

    Message = 'message',
    Abandon = 'abandon',
    TempsEcoule = 'tempsEcoule',

    AnnonceFinPartie = 'annonceFinPartie',
    FinDePartie = 'finDePartie',

    VerifierSocket = 'verifierSocket',
    SocketInvalide = 'socketInvalide',

    IndiceUtilise = 'indiceUtilise',
    CreerOuRejoindreTempsLimite = 'creerOuRejoindreTempsLimite',
    StatutPartie = 'statutPartie',
    ProchainJeuTempsLimite = 'prochainJeuTempsLimite',
}
