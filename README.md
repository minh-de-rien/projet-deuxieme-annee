---

# Projet LOG2990 - Polytechnique Montréal
Projet de logiciel d'application Web

# Auteur.es
[Nils Coulier](https://github.com/Ohdrak)  
[Minh Ngoc Do](https://github.com/minh-de-rien)  
[Jolan Le Clainche](https://github.com/JolanLec)  
[Juliette Mathivet](https://github.com/Juliette-Mathivet) 
[Kevin Peymani] (https://github.com/KevinPeymani) 
[Nemro Yapmi Nji Monluh]

---

[Description](#description) • [Page d'acceuil](#page-dacceuil) • [Mode classique](#mode-classique) • [Mode temps limité](#mode-temps-limité) • [Admistration](#administration) • [Outils de développement](#outils-de-développement)

# Description

Le but du projet est de développer une version web du jeu des sept différences, aussi appelé le jeu des sept erreurs. Le concept de ce jeu, que l’on peut parfois retrouver dans les pages d’un journal, est très simple. Deux images sont présentées : une originale et une modifiée. L’image modifiée comporte sept différences et le but est de toutes les identifier.

Ce jeu permet aux joueurs de faire une partie à deux ou en solo et offre deux modes de jeu : Classique et Temps Limité. Divers paramètres de jeu sont configurables. Il est aussi possible de concevoir ses propres jeux. 


## Page d'accueil

![Image montrant la page d'accuei]()

C'est a première page qui s'affiche lorsqu'on accède au site web. À travers les boutons *Mode Classique*, *Mode temps limité* et *Administration*, elle permet d'orienter les joueurs vers le contenu souhaité.

## Mode classique

![Image montrant la page du mode classique]()

En Classique, le but est de trouver rapidement toutes les différences lorsque l’on joue en solo. Dans une partie à deux, appelée le « un contre un », le but du joueur est d’atteindre un certain seuil de différences trouvées avant que son adversaire n’y parvienne.

## Mode temps limité

![Image montrant la page du mode temps limité]()

En Temps Limité, l’objectif est de trouver une seule différence sur le plus de paires d'images originale/modifiée possible qui sont présentées successivement. Dès qu’une différence est identifiée, on passe au duo suivant Les joueurs doivent agir rapidement avant qu’un compte à rebours n’expire. Contrairement au mode Classique, le jeu à deux en Temps Limité est de type coopératif.

## Administration 

![Image montrant la page de création de jeu]()

La vue d'administration, présentée de manière similaire à la vue de sélection de jeu, offre plusieurs fonctionnalités, telles que la suppression de jeux, la réinitialisation des temps établis par les meilleurs joueurs, ainsi que la possibilité de créer de nouveaux jeux. Cette création peut se faire en téléchargeant des images ou en utilisant les outils de dessin mis à disposition.

## Outils de développement

-   client : le site Web fait avec le cadriciel(_framework_) **Angular**.
-   serveur : le serveur dynamique bâti avec la librairie **NestJs**.

### Tests unitaires et couverture de code

Les tests se retrouvent dans les fichiers `*.spec.ts` dans le code source des deux projets. Le client utilise la librairie _Jasmine_ et le serveur utilise _Mocha_,_Chai_, _Sinon_ et _Supertest_.

### Linter et assurance qualité

Le projet vient avec un ensemble de règles d'assurance qualité pour le code et son format. Les règles pour le linter sont disponibles dans le fichier `eslintrc.json` dans le dossier du client et du server.

### Intégration continue

Ce projet a initialement été développé sur la plateforme GitLab et une configuration d'intégration continue (_Continuous Integration_ ou _CI_) a été appliquée pour celui-ci.

Cette configuration permet de lancer un pipeline de validations sur le projet en 4 étapes dans l'ordre suivant: _install_, _lint_, _build_ et _test_. Si une de ses étapes échoue, le pipeline est marqué comme échouée et une notification est visible sur GitLab.

Le pipeline est lancé suite aux 2 actions suivantes : lors d'un commit sur la branche master ou dans le cas d'une Merge Request (MR) entre 2 branches. Dans le cas d'une MR, chaque nouveau commit lancera un nouveau pipeline de validation.
