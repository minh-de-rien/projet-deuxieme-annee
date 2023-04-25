---

# Projet LOG2990 - Polytechnique Montréal
Projet de logiciel d'application Web

# Auteur.es
[Nils Coulier](https://github.com/Ohdrak)  
[Minh Ngoc Do](https://github.com/minh-de-rien)  
[Jolan Le Clainche](https://github.com/JolanLec)  
[Juliette Mathivet](https://github.com/Juliette-Mathivet)  
[Kevin Peymani](https://github.com/KevinPeymani)  
[Nemro Yapmi Nji Monluh]

---

[Description](#description) • [Page d'acceuil](#page-dacceuil) • [Mode classique](#mode-classique) • [Mode temps limité](#mode-temps-limité) • [Admistration](#administration) • [Outils de développement](#outils-de-développement)

# Description

L'objectif de ce projet consiste à élaborer une version web du célèbre jeu des sept différences, également connu sous le nom de jeu des sept erreurs. Ce jeu, souvent présenté dans les pages de journaux, met en scène deux images : une originale et une modifiée, avec sept différences à trouver dans cette dernière.

Le jeu propose une expérience de jeu en solo ou en duo, avec deux modes de jeu distincts : Classique et Temps Limité. Les joueurs ont la possibilité de personnaliser différents paramètres de jeu selon leurs préférences. En outre, le jeu permet aux utilisateurs de créer et de personnaliser leurs propres jeux, offrant ainsi une expérience de jeu unique et personnalisée.


## Page d'accueil

![Image montrant la page d'accueil](https://github.com/minh-de-rien/projet-deuxieme-annee/blob/main/readme/page-accueil.png)

La page d'accueil du site web est la première interface visible par l'utilisateur lorsqu'il accède au site. Elle oriente les joueurs vers le contenu souhaité, en utilisant des boutons tels que *Mode Classique*, *Mode temps limité* et *Administration*. Ces boutons facilitent la navigation et l'accès aux fonctionnalités du site, permettant aux joueurs de découvrir rapidement les modes de jeu disponibles et les options de personnalisation.

## Mode classique

![Image montrant la page du mode classique]()

Dans le mode Classique, l'objectif consiste à trouver rapidement toutes les différences dans une partie en solo. En revanche, dans le mode multijoueur « Un contre Un », le joueur doit atteindre un certain seuil de différences trouvées avant son adversaire.

## Mode temps limité

![Image montrant la page du mode temps limité]()

Dans le mode de jeu Temps Limité, l'objectif consiste à trouver une seule différence dans le plus grand nombre possible de paires d'images originale/modifiée qui sont présentées successivement. Une fois qu'une différence est identifiée, les joueurs passent automatiquement à la paire d'images suivante. Les joueurs doivent agir rapidement pour identifier les différences avant que le compte à rebours ne s'écoule. À la différence du mode Classique, le mode multijoueur Temps Limité est de type coopératif, les joueurs étant encouragés à collaborer pour améliorer leur score.

## Administration 

![Image montrant la page de création de jeu](https://github.com/minh-de-rien/projet-deuxieme-annee/blob/main/readme/page-creation-jeu.png)

La vue d'administration, présentée de manière similaire à la vue de sélection de jeu, offre plusieurs fonctionnalités, telles que la suppression de jeux, la réinitialisation des temps établis par les meilleurs joueurs, ainsi que la possibilité de créer de nouveaux jeux. Cette création peut se faire en téléchargeant des images ou en utilisant les outils de dessin mis à disposition.

## Outils de développement

-   Client : le site Web est fait avec le cadriciel(_framework_) **Angular**.
-   Serveur : le serveur dynamique bâti avec la librairie **NestJs**.

-   SGDB : les données du jeu sont hébergées sur la base de données **MongoDB**.
-   Déploiement : Les services **GitLab Pages** et **AWS** sont utilisés.

### Tests unitaires et couverture de code

Les tests se retrouvent dans les fichiers `*.spec.ts` dans les dossiers *client* et *server*. Le client utilise la librairie _Jasmine_ et le serveur utilise _Mocha_, _Chai_, _Sinon_ et _Supertest_.

### Linter et assurance qualité

Le projet est livré avec un ensemble de règles pour l'assurance qualité du code et de son format, disponibles dans le fichier `eslintrc.json` dans les dossiers *client* et *server*.

### Intégration continue

Ce projet a initialement été développé et maintenu à travers la plateforme GitLab et une configuration d'intégration continue (_Continuous Integration_ ou _CI_) a été appliquée pour celui-ci.

Cette configuration permet de lancer un pipeline de validations sur le projet en quatre (4) étapes dans l'ordre suivant: _install_, _lint_, _build_ et _test_. Si une de ces étapes échoue, le pipeline est marqué comme échoué et une notification est visible sur GitLab.

Le pipeline est lancé suite aux deux (2) actions suivantes : lors d'un commit sur la branche master ou dans le cas d'une Merge Request (MR) entre 2 branches. Dans le cas d'une MR, chaque nouveau commit lancera un nouveau pipeline de validation.

---
Équipe 103  
5 décembre 2022
