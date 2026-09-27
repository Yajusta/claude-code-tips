---
name: pptx-motion-deck
description: Transforme un PPTX en présentation motion design HTML autonome (GSAP + canvas 2D), découpée en chapitres avec pause, navigation clavier et barre d'icônes. À utiliser quand l'utilisateur fournit un .pptx et demande un motion design, une version animée ou une présentation HTML animée de son contenu.
---

# PPTX → présentation motion design HTML

Cette skill prend un PPTX, l'analyse, pose les bonnes questions, puis construit **un seul fichier HTML autonome et hors ligne** : une présentation animée en 1920×1080, découpée en *chapitres* que l'orateur déclenche un par un.

La technologie retenue est **HTML/CSS + GSAP (timelines) + canvas 2D** pour le décor, avec du SVG pour les flèches et les diagrammes. C'est ce qui rend le mieux pour du contenu de présentation : texte net, timelines pausables, chapitres rejouables. N'utilise three.js que si l'utilisateur veut explicitement un décor 3D. Dans ce cas, garde le moteur de chapitres ci-dessous et remplace seulement le module de décor.

## Contrat de navigation (à respecter à l'identique)

- **Chapitre** = une étape d'animation qui joue puis s'arrête. Une slide peut produire plusieurs chapitres (révélations successives).
- **Flèche droite** ou **Page bas** : chapitre suivant. Si le chapitre courant n'a pas fini, il est complété instantanément avant que le suivant démarre.
- **Flèche gauche** ou **Page haut** : chapitre précédent. Il est rejoué depuis son début, sur l'état final des chapitres qui le précèdent.
- **Espace** : pause ou reprise pendant une animation. Quand le chapitre est fini, Espace lance le suivant. Au chargement, un écran « Espace pour démarrer » attend.
- **Molette** : vers le bas = chapitre suivant, vers le haut = chapitre précédent (un cran = un chapitre, anti-rafale de 700 ms pour les pavés tactiles).
- **Clic gauche** n'importe où hors de la barre d'icônes : même comportement qu'Espace.
- **Début** : retour au début. **F** : plein écran.
- **Barre d'icônes en bas**, en pilule semi-transparente : retour au début · chapitre précédent · pause/lecture · chapitre suivant · compteur « 12 / 68 · Titre de scène » · plein écran. Quand le chapitre est fini, le bouton central devient une flèche qui pulse.
- **Affichage de la barre** : un bouton réglages (roue dentée) ouvre un menu à trois modes, mémorisé dans le navigateur (`localStorage`, clé `deck.hudMode`) ; la touche **H** passe d'un mode à l'autre avec un bref message :
  - **Visible quelques secondes** (défaut) : la barre apparaît à chaque action ou mouvement de souris, puis se masque après ~2,6 s ;
  - **Toujours visible** ;
  - **Souris en bas de l'écran** : la barre n'apparaît que si la souris est dans la zone basse, dont la hauteur = hauteur de la barre + 2 × son écart avec le bas de la fenêtre (calculée, pas codée en dur). Le clavier ne la fait pas apparaître.
- Menu ouvert : un clic sur la présentation ou Échap le ferme, sans changer de chapitre.
- Dans tous les modes, le curseur se masque après ~2,6 s d'immobilité. Une barre de progression fine s'affiche en bas.
- Les boucles d'ambiance (particules, défilement lent) tournent hors timeline. La pause les fige aussi.

Tout cela est déjà implémenté dans `assets/engine.js`. **Ne le réécris pas : copie-le.**

## Fichiers de la skill

Tous les chemins ci-dessous sont relatifs au dossier de cette skill (celui qui contient ce SKILL.md). Copie-les dans ton dossier de travail avant de commencer.

| Fichier | Rôle |
|---|---|
| `assets/template.html` | Squelette HTML : CSS (tokens de charte), barre d'icônes, placeholders `%%…%%` remplis par build.py |
| `assets/engine.js` | Moteur : mise à l'échelle, décor canvas, mises en page, helpers d'animation, machine à chapitres, clavier et barre d'icônes. À copier tel quel |
| `scripts/build.py` | Assemble un seul fichier HTML autonome (tout en base64, images en WebP) |
| `scripts/shoot.js` | Vérification Playwright : capture de chaque chapitre et test de navigation |
| `scripts/sheets.py` | Planches contact 2×3 des captures |
| `examples/scenes-exemple.js` | Scènes d'exemple : helpers `hd`, `shotHTML`, `marchDash`, `sectionScene`, couverture, section, capture + zoom, flux avec particules |

## Étape 1 — Analyser le PPTX

Travaille dans un dossier de travail (scratchpad). Si le PPTX est sur le poste de l'utilisateur, stage-le.

```bash
mkdir -p deck && cp <fichier>.pptx deck/d.pptx && cd deck
python3 -m markitdown d.pptx > content.md                     # texte, slide par slide
soffice --headless --convert-to pdf d.pptx && pdftoppm -r 40 -png d.pdf s   # vignettes
unzip -o -q d.pptx -d x && ls -la x/ppt/media                  # images embarquées
grep -o 'media/[^"]*' x/ppt/slides/_rels/*.rels                # quelle image sur quelle slide
grep -oE '<a:(dk[12]|lt[12]|accent[1-6])><a:(srgbClr|sysClr)[^>]*' x/ppt/theme/theme1.xml   # couleurs du thème (nom → val / lastClr)
grep -o 'typeface="[^"]*"' x/ppt/theme/theme1.xml | head -4                 # polices du thème
```

Assemble les vignettes en une planche (PIL, 4 colonnes) et **regarde-la** avec Read. Regarde aussi chaque image de `x/ppt/media` et, en plus grand (`pdftoppm -r 110 -f N -l N`), les slides complexes (diagrammes, schémas).

Classe ensuite chaque slide :

- couverture, sommaire, intercalaire de section ;
- contenu : cartes, liste, tableau, étapes, comparaison, avant/après, code ;
- slide qui n'est qu'une capture (à fusionner dans la slide précédente sous forme de zoom plein écran) ;
- diagramme à reconstruire en HTML/SVG ;
- **placeholder** (« capture à insérer », « cf. document ») : à signaler à l'utilisateur.

Note au passage les slides denses, qui méritent plusieurs chapitres.

## Étape 2 — Poser les questions (AskUserQuestion, un seul appel, 4 questions max)

Pose les questions après l'analyse, pour qu'elles soient concrètes. Mets l'option recommandée en premier.

1. **Granularité des chapitres** :
   - « 1 slide = 1 chapitre » (~N chapitres) ;
   - « Révélations internes » : les slides denses sont découpées bloc par bloc (~1,5 à 2,5 × N) ;
   - « 1 section = 1 chapitre ».
2. **Charte graphique**, à demander à chaque fois. Les couleurs viennent **uniquement** du thème du PPTX ou de l'utilisateur, jamais d'une palette par défaut. Montre dans la question les couleurs du thème trouvées à l'étape 1 :
   - « Style du PPTX, clair » (recommandé) ou « Style du PPTX, sombre » : couleurs et polices du thème, logo extrait de `media` ;
   - « Mes couleurs » : l'utilisateur les donne via « Other » (hex ou description : couleur principale, secondaire, fond, texte). Complète ce qu'il ne précise pas avec le thème du PPTX.
3. **Captures d'écran** : les intégrer animées (fenêtre stylisée, puis zoom plein écran au chapitre suivant), ou les recréer en schémas.
4. **Placeholders et slides à part** : les garder en écran de transition, les retirer, ou attendre que l'utilisateur fournisse les images.

Si la session est sans surveillance, prends les options recommandées et annonce-les (donc les couleurs du thème PPTX).

## Étape 3 — Dépendances hors ligne

Le fichier final ne doit dépendre d'aucun réseau. Le CDN est souvent bloqué dans le sandbox, **npm fonctionne** :

```bash
mkdir -p n && cd n && npm pack gsap@3.12.5 @fontsource-variable/open-sans && for f in *.tgz; do mkdir -p "${f%.tgz}"; tar xzf "$f" -C "${f%.tgz}"; done
# gsap : n/gsap-3.12.5/package/dist/gsap.min.js
# police corps : n/fontsource-variable-open-sans-*/package/files/open-sans-latin-wght-normal.woff2
```

Police de titre : celle du thème (ou demandée par l'utilisateur) si elle existe chez fontsource (`npm pack @fontsource/<nom>`), sinon une proche (Inter, Montserrat, Poppins…).

## Étape 4 — Construire

Arborescence de travail :

```
src/template.html   (copie de assets/template.html)
src/engine.js       (copie de assets/engine.js ; seuls LAYOUTS/décor s'adaptent)
src/scenes1.js …    (tes scènes : commence par les helpers de examples/scenes-exemple.js)
src/assets.json     (palette, chemins gsap, polices, logo, images → IMG.cle ; format documenté en tête de build.py)
```

`python3 <skill>/scripts/build.py src out/<Nom>.html`

### Adapter la charte

Le template n'a **aucune couleur en dur** : `build.py` génère tous les tokens (`--accent-100…700`, `--ink-*`, `--paper-*`, `--mid-*`, `--warn-*`, `--danger-*`, `--*-rgb`) à partir de `palette` dans `assets.json`, et s'arrête si elle manque. Remplis ses 7 clés avec les couleurs retenues à l'étape 2 :

| Clé | Rôle | Thème PPTX | Couleurs de l'utilisateur |
|---|---|---|---|
| `accent` | accent principal (pastilles, tags, progression) | accent1 | couleur principale |
| `accent2` | accent secondaire, étoile de décor en surbrillance | accent2 | couleur secondaire |
| `ink` | texte, cartes sombres | dk1 (ou dk2 s'il est plus coloré) | couleur de texte |
| `paper` | fond | lt1 (ou lt2) | couleur de fond |
| `mid` | gris : traits, flèches, disque, décor | dk2, sinon un gris entre ink et paper | idem |
| `warn` / `danger` | tags et cartes d'alerte | l'accent orangé / rouge du thème s'il existe, sinon accent3 / accent4 | idem, ou thème |

Ne reprends jamais une couleur qui n'est ni dans le thème, ni donnée par l'utilisateur, y compris dans les scènes : utilise `var(--…)` et `rgba(var(--ink-rgb),.2)`, pas d'hex en dur.

- **Variante sombre** : passe le fond du `body` et de `#stage` en `--ink-800`, inverse les couleurs de texte et mets le texte des cartes en `--paper-050`.
- **Décor** : la constellation d'étoiles de `engine.js` prend ses couleurs dans la palette (`--mid-500`, `--accent2-500`). Si le master du PPTX a son propre motif, remplace-le en gardant la même API `Stars.set(mode, origine)` et `Stars.resize/start` (par exemple : cercles flous dans les couleurs d'accent). Remplace aussi le disque par la forme de fond du PPTX (bandeau, coin coloré…), ou masque `#disc` si elle n'existe pas.
- Il y a trois mises en page, qui déplacent le disque, le logo et le décor avec une transition fluide : `cover`, `section`, `content`. Il en existe aussi une quatrième, `diagram` (sans décor).

### API des scènes

```js
scene({ name: 'Titre court (compteur)', layout: 'content',
  html: hd('Surtitre', 'Titre') + `<div class="c"> … </div>`,
  steps: [ (tl, A, ctx) => { … }, (tl, A, ctx) => { … } ] });   // 1 fonction = 1 chapitre
```

- **Scène** en 1920×1080 px. La zone de contenu `.c` va de x=132 à 1788 et de y=250 à ~950. Positionne tout en absolu : c'est fiable et c'est ce qui rend le mieux. Garde le coin inférieur droit libre (disque et logo).
- **Classe `.h`** = caché au départ. Tout élément révélé par un chapitre ultérieur doit avoir `.h`, ou être à l'intérieur d'un parent `.h`.
- **`data-split`** : le texte est découpé en mots, animés avec `A.words`. **`data-type`** : effet machine à écrire avec `A.type`.
- **Helpers** `A.*` : `rise`, `fade`, `pop`, `slide`, `wipe` (révélation par clip-path, idéal pour les captures), `words`, `head` (surtitre + titre, à placer en premier dans le chapitre 1 de chaque scène de contenu), `draw` (trace un chemin SVG ; `data-m="idMarker"` pose la pointe de flèche **à la fin** du tracé ; `data-dash="7 7"` pour les pointillés), `type`, `count`, `flow` (particules en boucle le long d'un chemin), `zoom` (capture en plein écran avec voile).
- Position GSAP : `'-=0.5'`, `'<'`, `'>'`, etc. Durée cible d'un chapitre : 1,5 à 3 s. **Jamais de tween infini dans `tl`** : les ambiances passent par `ctx.loop(gsap.to(…, {repeat:-1}))`. Passe `delay: tl.duration()` à `A.flow` pour que les particules n'apparaissent qu'une fois les éléments visibles.
- **Flèches** : `<svg class="wire" width=… height=… style="left:0;top:0">` avec `<path class="h …" data-m="ahX" d="…">` et `<defs><marker id="ahX">`. Les coordonnées sont celles du conteneur. Les `path` de tracé doivent être **enfants directs** du `svg.wire` : le style de trait (`svg.wire > path`) ne s'applique qu'à eux, et les pointes définies dans `<marker>` restent des **triangles pleins** dans leur couleur `fill`.
- Helpers HTML déjà prêts (`examples/scenes-exemple.js`) : `hd`, `shotHTML`, `marchDash`, `sectionScene`, `ic(nomIcone)`, avec les icônes Lucide incluses dans `ICONS`.

### Traduire chaque type de slide en motion

| Slide PPTX | Motion |
|---|---|
| Couverture | Pause de 0,5 s, titre mot à mot, filet qui se trace (scaleX), sous-titre, date |
| Sommaire | Lignes qui glissent de la gauche, filets tracés en décalé |
| Section | Grand numéro translucide qui glisse, surtitre qui se resserre (letter-spacing), titre, filet |
| Cartes / grille | Une rangée par chapitre, montée décalée ; pastilles d'icônes en `pop` |
| Tableau comparatif | Lignes tracées, puis **une colonne par chapitre** (`data-col`) |
| Étapes numérotées | 2 ou 3 lignes par chapitre ; l'étape clé en carte sombre, avec une icône qui tourne en `ctx.loop` si c'est une boucle |
| Flux A → B → C | Nœuds un par un, flèches tracées entre eux, particules `flow` en boucle |
| Capture seule | Fenêtre (`shotHTML`) révélée par `wipe` + dézoom de l'image, puis **chapitre suivant = `A.zoom`** |
| Code / commandes | Carte sombre, `A.type` sur chaque commande, commentaire en fondu |
| Avant / après | Image « avant » en `wipe`, puis le schéma « après » reconstruit nœud par nœud |
| Diagramme | Reconstruit en HTML + SVG pleine scène (layout `diagram`), **une phase par chapitre**, boucles en pointillés animés (`marchDash`) |
| Placeholder | Selon la réponse de l'utilisateur |

Soigne aussi la typographie : espaces insécables autour de « », la phrase « À retenir » mise en valeur dans une carte sombre, et une seule couleur d'accent par zone.

## Étape 5 — Vérifier (obligatoire)

```bash
NODE_PATH=$(npm root -g) node <skill>/scripts/shoot.js out/<Nom>.html shots && python3 <skill>/scripts/sheets.py shots
```

Regarde **toutes** les planches `shots/sheetNN.png` avec Read, puis corrige et recommence. Vérifie aussi que la sortie de `shoot.js` affiche « pause → paused », « reprise → playing » et `erreurs []`.

Pièges déjà rencontrés, à vérifier en priorité :

- Pointes de flèches creuses (contour de triangle au lieu d'un triangle plein) : une règle `svg.wire path{fill:none}` vide aussi les `path` des `<marker>`. Le template cible `svg.wire > path` ; garde ce sélecteur et les tracés en enfants directs du `svg`.
- Icône SVG dans un `.lbl` ou un `.tag` sans taille : elle devient énorme. Le CSS du template les dimensionne, mais une icône placée dans un `div` doit avoir une largeur et une hauteur explicites.
- Italique coupé par `.w{overflow:hidden}` : le padding-right du template compense déjà, ne l'enlève pas.
- Particules `flow` par-dessus les cartes : elles sont insérées en `prepend`, donc derrière. Garde les cartes positionnées.
- Titre trop long (`white-space:nowrap`) : il doit rester avant x ≈ 1700 sur les scènes `content`, à cause du décor en haut à droite.
- Éléments visibles trop tôt : il manque `.h`.
- Chapitre qui « ne finit jamais » : un tween long ou infini est dans `tl` au lieu de `ctx.loop`.
- Intercalaire : le grand numéro ne doit pas chevaucher le surtitre.
- Couverture : le bloc titre, filet, sous-titre et date doit rester compact.
- En test Playwright, la barre d'icônes masquée ne reçoit pas les clics : bouge la souris d'abord (comportement normal).

## Étape 6 — Livrer

- Écris le fichier HTML **dans le dossier de l'utilisateur, à côté du PPTX** (`device_commit_files`), sous le nom `<nom-du-pptx>.html`. Vérifie ensuite qu'il est complet : sa taille, et une fin de fichier en `</html>`.
- Réponds en quelques lignes :
  - où est le fichier ;
  - comment l'ouvrir (Chrome ou Edge, hors ligne) ;
  - les raccourcis clavier ;
  - ce qui a été fusionné, retiré ou ajouté par rapport au PPTX.
- Ne publie pas de page claude.ai sauf si l'utilisateur le demande.
