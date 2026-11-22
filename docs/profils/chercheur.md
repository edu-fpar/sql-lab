# Universitaire, chercheur

## Citer ce logiciel
Format APA :

> Parlant, F. (2026). *SQL Lab* [Logiciel pédagogique]. https://github.com/edu-fpar/sql-lab

BibTeX :

```bibtex
@software{parlant_sqllab_2026,
  author = {Parlant, François},
  title  = {SQL Lab : entraînement SQL avec correction automatique et correction pas à pas},
  year   = {2026},
  url    = {https://github.com/edu-fpar/sql-lab},
  note   = {Logiciel pédagogique, licence CC BY-NC-SA 4.0}
}
```

Le bouton **Cite this repository** de GitHub donne aussi ces références, à partir de
[CITATION.cff](https://github.com/edu-fpar/sql-lab/blob/main/CITATION.cff).

## L'utiliser dans une expérimentation
- L'outil ne collecte rien par défaut : pour recueillir des données, passez par un LMS. En
  SCORM, la plateforme reçoit le score et une interaction par question réussie, avec la
  requête de l'étudiant.
- Les diagnostics d'erreur sont codés dans `assets/compare.js` et `assets/compat.js`. Ce sont
  des catégories d'erreurs typiques (jointure oubliée, doublons, NULL, HAVING…), utiles pour
  une analyse.
- Les exercices sont des fichiers JSON versionnés. Une expérimentation peut donc figer une
  version précise (commit) et la citer.

Pour un projet de recherche ou une collaboration, [contactez-moi](https://edu-fpar.github.io/about.html).

## L'adapter à mon terrain
La licence (CC BY-NC-SA 4.0) permet de modifier l'outil pour un usage non commercial, en citant
l'auteur et en partageant vos adaptations sous la même licence. Vous pouvez ajouter vos bases,
vos questions et votre langue (voir [Langues](themes/langues)).
