---
title: stringyfy
description: Une bibliothèque npm simple qui fournit un ensemble de fonctions utilitaires pour manipuler et transformer des chaînes de caractères en JavaScript.
meta:
  - name: mots-clés
    content: stringyfy, npm, bibliothèque, utilitaire, fonctions, manipuler, transformer, chaînes de caractères, JavaScript
  - name: author
    content: stringyfy
  - name: date
    content: 2021-10-01
  - property: og:image
    content: https://cdn.jsdelivr.net/gh/stringyfy/assets/images/logo.png
sidebar: auto
category: Bibliothèques
---

# stringyfy

## Description

`stringyfy` est une bibliothèque npm simple qui fournit un ensemble de fonctions utilitaires pour manipuler et transformer des chaînes de caractères en JavaScript. Elle est légère, facile à utiliser et n'a aucune dépendance.

## Installation

Pour installer `stringyfy`, utilisez la commande suivante :

```bash
npm install stringyfy
```

## Utilisation

Voici un exemple simple d'utilisation de `stringyfy` :

```javascript
const stringyfy = require('stringyfy');

let str = "Bonjour, le monde !";

let result = stringyfy.reverse(str);

console.log(result); // Affiche : "! ednom el ,ruojnoB"
```

## API

### `reverse(str)`

Inverse la chaîne de caractères donnée.

### `capitalize(str)`

Met en majuscule la première lettre de la chaîne de caractères donnée.

### `lowercase(str)`

Convertit tous les caractères de la chaîne donnée en minuscules.

### `uppercase(str)`

Convertit tous les caractères de la chaîne donnée en majuscules.

## Contribution

Les pull requests sont les bienvenues. Pour les changements majeurs, veuillez d'abord ouvrir une issue pour discuter de ce que vous aimeriez modifier.

## Licence

MIT
