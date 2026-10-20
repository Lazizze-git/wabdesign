# DESIGN — panneau de l'outil de design

Fiche des choix visuels du panneau injecté dans les previews. Mode : **outil** (on règle,
on compare, on valide) ; la lisibilité des valeurs passe avant l'expression.

## Brief réécrit

Un panneau qu'Eliott ouvre et ferme des dizaines de fois par séance, posé par-dessus des sites
clients toujours différents. Il doit se faire oublier devant le site, rester lisible sur
n'importe quel fond, et rendre évident ce qui a été modifié. Ce qu'on doit voir d'abord : la
valeur en cours et le fait qu'elle soit modifiée ou non.

## Couleur

| Jeton | Valeur | Rôle | Origine |
|---|---|---|---|
| `--frame` | `#b1aebc` | fond du panneau (cadre, en-tête, onglets, sections) | demande écrite d'Eliott (20.10.2026), même famille gris-lilas que ses projets en cours (papier `#dfdee2`, voile `#d2d0da`) |
| `--ink` | `#141318` | tout texte posé sur le cadre, bouton principal | seule teinte qui tient sur un gris moyen (8,49:1, Lc 60) |
| `--well` | `#dcdae2` | surfaces où on lit et règle une valeur (champs, listes) | éclaircit le cadre dans sa teinte pour remonter le contraste du texte (Lc 84) |
| `--well-hi` | `#efeef3` | onglet et segment actifs, ligne survolée | palier suivant de la même échelle |
| `--edge` | `#5a566b` | bord des champs contre le cadre | plus discret qui passe 3:1 contre le cadre |
| `--ink-2` | `#3d3a4a` | texte secondaire, **uniquement sur `--well`** | sur le cadre, aucun gris ne passe : la hiérarchie y passe par la graisse |
| `--ink-3` | `#56526a` | unités, texte indicatif, **uniquement sur `--well`** | |
| `--accent` | `#0a3fb8` | sélection, focus, pastille « modifié », cadres dans la page | fonction : signaler un état. Teinte 222°, hors zone violette |
| `--danger` | `#7a1e10` | suppression, erreur | fonction |
| `--ok` | `#0b4a2a` | validation réussie | fonction |

**Verre dépoli** (demande d'Eliott, 20.10.2026) : le cadre est `#b1aebc` à 70 %, posé sur le site
flouté (22 px) après l'avoir éclairci et adouci (`contrast(0.2) brightness(1.75)`). Le site reste
deviné derrière, mais le cadre ne devient jamais plus sombre que `#b1aebc` : encre sur cadre entre
Lc 60 (site noir) et Lc 73 (site blanc). Surfaces de réglage, popovers et toasts restent opaques.
Retour au cadre opaque si le navigateur ne gère pas le flou ou si « réduire la transparence » est
activé dans macOS.

Règle : **jamais de gris clair sur le cadre.** Toutes les paires sont listées dans `paires.txt`
et vérifiées avec `verifier.mjs paires`.

## Typographie

Police du système (San Francisco sur Mac). Raison : le panneau est injecté dans des sites
clients ; charger une fonte ajouterait une requête et une famille dans la page qu'on est en
train de juger, et fausserait les essais de polices. C'est la police native des outils
d'Eliott (Figma, Finder), adaptée à un outil (mode « operate »).

Échelle d'interface dense : 12 px libellés et textes d'aide, 13 px valeurs et contrôles,
14 px titres de section (graisse 600), 15 px aperçus de police. Chasse fixe uniquement pour
les vraies données (valeurs CSS, sélecteurs, couleurs hex). Pas de capitales espacées.
Champs à 13 px : outil d'ordinateur, la règle des 16 px (zoom iOS) ne s'applique pas.

## Formes

Hiérarchie de rayons : panneau 10 px, surfaces et boutons 4 px, pastilles de couleur 3 px.
Une seule ombre, sous le panneau flottant (décalée, floue) : c'est la seule surface qui passe
au-dessus du site.

## Mouvement

Ouverture et fermeture au clavier (⌥ D) : **aucune animation** (action répétée, au clavier).
Seul retour : pression des boutons `scale(0.97)` en 120 ms, courbe `cubic-bezier(0.23, 1, 0.32, 1)`,
supprimée en mouvement réduit. Survols uniquement sous `(hover: hover) and (pointer: fine)`.

## Dans la page

Les cadres de sélection sont en `--accent` doublés d'un liseré blanc, pour rester visibles sur
un site clair comme sur un site sombre.
