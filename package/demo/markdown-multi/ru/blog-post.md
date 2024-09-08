---
title: stringyfy 1.0.1
description: Простая npm-библиотека, предоставляющая набор утилитарных функций для манипуляции и преобразования строк в JavaScript.
meta:
  - name: ключевые слова
    content: stringyfy, npm, библиотека, утилита, функции, манипулировать, преобразовывать, строки, JavaScript
  - name: author
    content: stringyfy
  - name: date
    content: 2021-10-01T00:00:00.000Z
  - property: og:image
    content: https://cdn.jsdelivr.net/gh/stringyfy/assets/images/logo.png
sidebar: auto
category: Библиотеки
---

# stringyfy

## Описание

`stringyfy` - это простая npm-библиотека, предоставляющая набор утилитарных функций для манипуляции и преобразования строк в JavaScript. Она легковесная, проста в использовании и не имеет зависимостей.

## Установка

Для установки `stringyfy` используйте следующую команду:

```bash
npm install stringyfy
```

## Использование

Вот простой пример использования `stringyfy`:

```javascript
const stringyfy = require('stringyfy');

let str = "Hello, World!";

let result = stringyfy.reverse(str);

console.log(result); // Выводит: "!dlroW ,olleH"
```

## API

### `reverse(str)`

Переворачивает заданную строку.

### `capitalize(str)`

Делает первую букву заданной строки заглавной.

### `lowercase(str)`

Преобразует все символы заданной строки в нижний регистр.

### `uppercase(str)`

Преобразует все символы заданной строки в верхний регистр.

## Вклад в проект

Пулл-реквесты приветствуются. Для значительных изменений сначала откройте issue, чтобы обсудить, что вы хотели бы изменить.

## Лицензия

MIT
