---
title: stringyfy
description: >-
  Una biblioteca npm sencilla que proporciona un conjunto de funciones
  utilitarias para manipular y transformar cadenas en JavaScript.
meta:
  - name: keywords
    content: >-
      stringyfy, npm, biblioteca, utilidades, funciones, manipular, transformar,
      cadenas, JavaScript
  - name: author
    content: stringyfy
  - name: date
    content: '2021-10-01T00:00:00.000Z'
  - property: 'og:image'
    content: 'https://cdn.jsdelivr.net/gh/stringyfy/assets/images/logo.png'
---

# stringyfy

## Descripción

`stringyfy` es una biblioteca npm sencilla que proporciona un conjunto de funciones utilitarias para manipular y transformar cadenas en JavaScript. Es ligera, fácil de usar y no tiene dependencias.

## Instalación

Para instalar `stringyfy`, usa el siguiente comando:

```bash
npm install stringyfy
```

## Uso

Aquí tienes un ejemplo sencillo de cómo usar `stringyfy`:

```javascript
const stringyfy = require('stringyfy');

let str = "Hello, World!";

let result = stringyfy.reverse(str);

console.log(result); // Muestra: "!dlroW ,olleH"
```

## API

### `reverse(str)`

Invierte la cadena dada.

### `capitalize(str)`

Capitaliza la primera letra de la cadena dada.

### `lowercase(str)`

Convierte todos los caracteres de la cadena dada a minúsculas.

### `uppercase(str)`

Convierte todos los caracteres de la cadena dada a mayúsculas.

## Contribuir

Las solicitudes de extracción son bienvenidas. Para cambios importantes, abre un issue primero para discutir lo que te gustaría cambiar.

## Licencia

MIT
