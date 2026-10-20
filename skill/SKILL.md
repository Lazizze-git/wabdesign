---
name: wabdesign
description: Ouvre le panneau de design en direct (outil « wabdesign ») par-dessus la preview locale du projet en cours, pour tester polices, couleurs, design system, textes et retouches d'éléments, puis les valider dans le code. À utiliser quand l'utilisateur tape /wabdesign, ou demande d'« ouvrir le panneau de design », « lancer wabdesign », « tester des polices / couleurs en live sur la preview ».
argument-hint: "[port de la preview | stop]"
---

# /wabdesign — ouvrir le panneau de design sur la preview

`wabdesign` est un relais local : il affiche la preview du projet avec un panneau par-dessus
(Polices, Couleurs, Inspecter, Design system, Modifs). Il se lance **depuis le dossier du projet**
(c'est ce dossier que « Valider » modifiera) et reste actif tant que la session tourne.

Réponds dans la langue de l'utilisateur, simplement, sans jargon technique.

## Si l'argument est `stop`

Arrête la tâche de fond `wabdesign` lancée dans cette session (et seulement elle). S'il n'y en a pas,
trouve le processus qui écoute sur le port du panneau (`lsof -nP -iTCP:4000 -sTCP:LISTEN`), vérifie que
c'est bien `wabdesign` pour ce projet, puis arrête-le. Confirme en une phrase. Ne touche jamais au serveur de preview.

## Sinon : ouvrir le panneau

1. **Vérifier que l'outil est installé** : `command -v wabdesign`.
   S'il manque, proposer de l'installer (`npm install -g github:Lazizze-git/wabdesign`, Node 20 ou plus)
   et l'installer si l'utilisateur accepte.

2. **Lancer l'outil dans le dossier du projet**, en tâche de fond (`run_in_background: true`) :
   - avec un port donné en argument : `wabdesign <port>` ;
   - sinon : `wabdesign` (il trouve seul la preview lancée depuis ce dossier, et rouvre le panneau s'il tourne déjà).

   Lis ensuite la sortie de la tâche pour récupérer la ligne `Preview avec panneau de design : http://localhost:…`
   ou `Le panneau tourne déjà pour ce projet : …`. Le navigateur s'ouvre tout seul sur cette adresse.

3. **Si la sortie dit « Aucune preview détectée »** : la preview du projet n'est pas lancée.
   - Lis `package.json` pour trouver le script de dev (`dev`, sinon `start`).
   - Choisis un port libre (vérifie avec `lsof -nP -iTCP:<port> -sTCP:LISTEN`), en commençant à 3000.
   - Lance la preview en tâche de fond depuis le dossier du projet, sur ce port :
     Next.js `npm run dev -- -p <port>` · Vite / Astro `npm run dev -- --port <port>` · autre : le script tel quel.
   - Attends la ligne « Ready » / « Local: » dans sa sortie, puis lance `wabdesign <port>` en tâche de fond (étape 2).
   - Si `node_modules` manque, lance d'abord `npm install`.

4. **Si la sortie signale « Aucune preview lancée depuis ce dossier : j'utilise celle du port … »**,
   vérifie que ce port correspond bien à ce projet. Sinon, arrête cette tâche et applique l'étape 3.

## Message final (court)

- l'adresse à utiliser (ex. `http://localhost:4000`), en précisant que c'est celle-là et pas celle de la preview seule ;
- les raccourcis : **⌥ D** afficher/cacher · **⌥ S** cliquer un élément · **⌥ A** (maintenir) voir l'original · **⌘ Z** annuler
  (Alt et Ctrl sous Windows et Linux) ;
- « Valider » applique les modifications dans le code. Si le projet n'a pas de sauvegarde Git
  (`git rev-parse --is-inside-work-tree` échoue), le signaler en une phrase et proposer d'en créer une avant de valider.

## En cas de problème

- La page affiche une erreur du site (clés manquantes, base de données…) : c'est le projet, pas l'outil. Le dire clairement ;
  le panneau reste utilisable sur ce qui s'affiche.
- « Port occupé » ou outil introuvable : relancer l'étape correspondante, ne jamais arrêter un processus qui n'appartient pas à ce projet.
