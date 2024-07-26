---
title: stringyfy
description: A simple npm library that provides a set of utility functions to manipulate and transform strings in JavaScript.
meta:
  - name: keywords
    content: stringyfy, npm, library, utility, functions, manipulate, transform, strings, JavaScript
  - name: author
    content: stringyfy
  - name: date
    content: 2021-10-01
  - property: og:image
    content: https://cdn.jsdelivr.net/gh/stringyfy/assets/images/logo.png
---

# stringyfy

## Description

`stringyfy` is a simple npm library that provides a set of utility functions to manipulate and transform strings in JavaScript. It's lightweight, easy to use, and has no dependencies.

## Installation

To install `stringyfy`, use the following command:

```bash
npm install stringyfy
```

## Usage

Here's a simple example of how to use `stringyfy`:

```javascript
const stringyfy = require('stringyfy');

let str = "Hello, World!";

let result = stringyfy.reverse(str);

console.log(result); // Outputs: "!dlroW ,olleH"
```

## API

### `reverse(str)`

Reverses the given string.

### `capitalize(str)`

Capitalizes the first letter of the given string.

### `lowercase(str)`

Converts all the characters in the given string to lowercase.

### `uppercase(str)`

Converts all the characters in the given string to uppercase.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
