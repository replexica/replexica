---
title: stringyfy
description: Простая npm-библиотека, предоставляющая набор утилитарных функций для манипуляции и преобразования строк в JavaScript.
meta:
  - name: ключевые слова
    content: stringyfy, npm, библиотека, утилита, функции, манипуляция, преобразование, строки, JavaScript
  - name: author
    content: stringyfy
  - name: date
    content: 2021-10-01
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

let str = "Привет, Мир!";

let result = stringyfy.reverse(str);

console.log(result); // Выводит: "!риМ ,тевирП"
```

## API

### `reverse(str)`

Переворачивает заданную строку.

### `capitalize(str)`

Делает первую букву заданной строки заглавной.

### `lowercase(str)`

Преобразует все символы в заданной строке в нижний регистр.

### `uppercase(str)`

Преобразует все символы в заданной строке в верхний регистр.

## Вклад в проект

Пулл-реквесты приветствуются. Для значительных изменений, пожалуйста, сначала откройте issue, чтобы обсудить, что вы хотели бы изменить.

## Лицензия

MIT
