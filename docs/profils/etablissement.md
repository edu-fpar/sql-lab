# 🏫 Établissement, service numérique

## Déployer dans le LMS
- **Paquet SCORM 1.2**, un par exercice, compatible avec Moodle, Chamilo et les autres LMS
  SCORM.
- Le paquet contient toute l'application **sans appel extérieur** (pas de CDN) et il est
  verrouillé sur l'exercice.
- Il transmet le score, le statut (incomplet, terminé, réussi) et la reprise.
- Il enregistre une interaction par question réussie.

## Héberger en interne
C'est un site **statique**, sans serveur d'application ni base de données côté serveur. Copiez
le dépôt sur n'importe quel serveur web (Apache, Nginx, IIS, GitHub Pages, intranet). Le seul
point d'attention : servir les fichiers `.wasm` avec le type MIME `application/wasm`.

## Vérifier la conformité (RGPD)
- Aucune donnée personnelle n'est collectée ni envoyée : pas de compte, pas de statistiques,
  pas de traceur, pas de police ni de script tiers.
- Les requêtes s'exécutent dans le navigateur. La progression reste dans le stockage local de
  l'appareil, ou dans le LMS en SCORM.
- Les questions partagées par lien sont placées après le `#` de l'adresse : elles ne sont
  jamais transmises au serveur.
