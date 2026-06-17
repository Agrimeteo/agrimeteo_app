# Analyse UML - AgriMétéo

Cette analyse UML a été refaite à partir du code réel du projet AgriMétéo, en tenant compte :

- du backend `Node.js + Express + TypeScript`
- du frontend applicatif `React + Vite`
- du site marketing `React + Vite`
- de la base de données et des politiques Supabase
- des modules récents : communauté, paramètres utilisateur, permissions admin, audit logs, plans de culture et météo

## Objectif

Le but de cette documentation est de fournir une vue claire du système final pour :

- la maintenance technique
- l'onboarding d'un nouveau développeur
- la présentation du projet dans un contexte académique ou portfolio
- la préparation d'évolutions futures

## Diagrammes inclus

Fichier Draw.io directement ouvrable :

- [agrimeteo-uml-complete.drawio](./agrimeteo-uml-complete.drawio)

Version Markdown / Mermaid de reference :

1. [01-system-context-and-use-cases.md](./01-system-context-and-use-cases.md)
   Vue acteurs / cas d'usage principaux.

2. [02-component-diagram.md](./02-component-diagram.md)
   Vue architecture logique backend, frontend, services et base.

3. [03-deployment-diagram.md](./03-deployment-diagram.md)
   Vue de déploiement cible du projet complet.

4. [04-domain-class-diagram.md](./04-domain-class-diagram.md)
   Vue métier des principales entités persistées.

5. [05-auth-and-profile-sequence.md](./05-auth-and-profile-sequence.md)
   Séquence d'authentification et synchronisation de profil.

6. [06-crop-weather-recommendation-sequence.md](./06-crop-weather-recommendation-sequence.md)
   Séquence crop -> météo -> recommandations -> notifications.

7. [07-community-interaction-sequence.md](./07-community-interaction-sequence.md)
   Séquence de publication, commentaire et like dans la communauté.

8. [08-admin-permissions-audit-sequence.md](./08-admin-permissions-audit-sequence.md)
   Séquence d'administration avec permissions et audit.

9. [09-crop-lifecycle-state-diagram.md](./09-crop-lifecycle-state-diagram.md)
   États métier du cycle d'une culture.

## Source graphique existante

Le fichier historique suivant est conservé :

- [agrosmart-uml.drawio](./agrosmart-uml.drawio)

Cette nouvelle série de diagrammes Mermaid ne remplace pas forcément le Draw.io, mais elle fournit une version textuelle, diffable, et plus facile à maintenir dans Git.

## Hypothèses de modélisation

- Le projet est modélisé comme une plateforme composée de trois surfaces :
  - site marketing
  - application utilisateur
  - espace d'administration
- Supabase joue plusieurs rôles :
  - authentification
  - base de données PostgreSQL
  - storage
  - RLS / gouvernance des accès
- Certaines tables ou colonnes, notamment autour des `reports`, ont été déduites à partir du code backend lorsque le schéma SQL central n'était pas intégralement explicité dans un seul fichier.

## Modules métier couverts

- Authentification et profils
- Gestion des cultures
- Plans de culture
- Météo et alertes
- Recommandations
- Rapports / diagnostic
- Communauté
- Paramètres utilisateur
- Notifications
- Administration
- Permissions RBAC
- Audit logs
