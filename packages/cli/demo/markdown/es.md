# stringyfy

## Descripción

`stringyfy` es una biblioteca npm sencilla que ofrece un conjunto de funciones de utilidad para manipular y transformar cadenas en JavaScript. Es ligera, fácil de usar y no tiene dependencias.

## Instalación

Para instalar `stringyfy`, utiliza el siguiente comando:

```bash
npm install stringyfy
```

## Uso

Aquí tienes un ejemplo simple de cómo usar `stringyfy`:

```javascript
const stringyfy = require('stringyfy');

let str = "Hola, Mundo!";

let resultado = stringyfy.reverse(str);

console.log(resultado); // Muestra: "!odnuM ,aloH"
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

## Contribuciones

Las solicitudes de extracción son bienvenidas. Para cambios importantes, por favor abre un problema primero para discutir lo que te gustaría cambiar.

## Licencia

MIT
