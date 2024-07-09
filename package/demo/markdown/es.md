# stringyfy

## Descripción

`stringyfy` es una biblioteca npm sencilla que ofrece un conjunto de funciones utilitarias para manipular y transformar cadenas en JavaScript. Es ligera, fácil de usar y no tiene dependencias.

## Instalación

Para instalar `stringyfy`, usa el siguiente comando:

```bash
npm install stringyfy
```

## Uso

Aquí tienes un ejemplo sencillo de cómo usar `stringyfy`:

```javascript
const stringyfy = require('stringyfy');

let str = "¡Hola, Mundo!";

let result = stringyfy.reverse(str);

console.log(result); // Muestra: "!odnuM ,aloH"
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
