import { describe, it, expect, vi, beforeEach } from 'vitest';
import _ from 'lodash';
import fs from 'fs/promises';
import createBucketLoader from './index';

describe('bucket loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('android bucket loader', () => {
    it('should load android data', async () => {
      setupFileMocks();

      const input = `
        <resources>
          <string name="button.title">Submit</string>
        </resources>
      `.trim();
      const expectedOutput = { 'button.title': 'Submit' };

      mockFileOperations(input);

      const androidLoader = createBucketLoader('android', 'values-[locale]/strings.xml');
      androidLoader.setDefaultLocale('en');
      const data = await androidLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save android data', async () => {
      setupFileMocks();

      const input = `
        <resources>
          <string name="button.title">Submit</string>
        </resources>
      `.trim();
      const payload = { 'button.title': 'Enviar' };
      const expectedOutput = `<resources>\n  <string name="button.title">Enviar</string>\n</resources>\n`;

      mockFileOperations(input);

      const androidLoader = createBucketLoader('android', 'values-[locale]/strings.xml');
      androidLoader.setDefaultLocale('en');
      await androidLoader.pull('en');

      await androidLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'values-es/strings.xml',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('csv bucket loader', () => {
    it('should load csv data', async () => {
      setupFileMocks();

      const input = `id,en\nbutton.title,Submit`;
      const expectedOutput = { 'button.title': 'Submit' };

      mockFileOperations(input);

      const csvLoader = createBucketLoader('csv', 'i18n.csv');
      csvLoader.setDefaultLocale('en');
      const data = await csvLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save csv data', async () => {
      setupFileMocks();

      const input = `id,en,es\nbutton.title,Submit,`;
      const payload = { 'button.title': 'Enviar' };
      const expectedOutput = `id,en,es\nbutton.title,Submit,Enviar\n`;

      mockFileOperations(input);

      const csvLoader = createBucketLoader('csv', 'i18n.csv');
      csvLoader.setDefaultLocale('en');
      await csvLoader.pull('en');

      await csvLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n.csv',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('flutter bucket loader', () => {
    it('should load flutter data', async () => {
      setupFileMocks();

      const input = `{
        "@@locale": "en",
        "greeting": "Hello, {name}!",
        "@greeting": {
          "description": "A greeting with a name placeholder",
          "placeholders": {
            "name": {
              "type": "String",
              "example": "John"
            }
          }
        }
      }`;
      const expectedOutput = { 'greeting': 'Hello, {name}!' };

      mockFileOperations(input);

      const flutterLoader = createBucketLoader('flutter', 'lib/l10n/app_[locale].arb');
      flutterLoader.setDefaultLocale('en');
      const data = await flutterLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save flutter data', async () => {
      setupFileMocks();

      const input = `{
        "@@locale": "en",
        "greeting": "Hello, {name}!",
        "@greeting": {
          "description": "A greeting with a name placeholder",
          "placeholders": {
            "name": {
              "type": "String",
              "example": "John"
            }
          }
        }
      }`;
      const payload = { 'greeting': '¡Hola, {name}!' };
      const expectedOutput = JSON.stringify({
        "@@locale": "es",
        "greeting": "¡Hola, {name}!",
        "@greeting": {
          "description": "A greeting with a name placeholder",
          "placeholders": {
            "name": {
              "type": "String",
              "example": "John"
            }
          }
        }
      }, null, 2) + '\n';

      mockFileOperations(input);

      const flutterLoader = createBucketLoader('flutter', 'lib/l10n/app_[locale].arb');
      flutterLoader.setDefaultLocale('en');
      await flutterLoader.pull('en');

      await flutterLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'lib/l10n/app_es.arb',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' }
      );
    });
  });

  describe('html bucket loader', () => {
    it('should load html data', async () => {
      setupFileMocks();

      const input = `
<html>
  <head>
    <title>My Page</title>
    <meta name="description" content="Page description" />
  </head>
  <body>
    some simple text without an html tag
    <h1>Hello, world!</h1>
    <p>
      This is a paragraph with a 
      <a href="https://example.com">link</a>
      and 
      <b>
        bold and <i>italic text</i>
      </b>
      .
    </p>
  </body>
</html>
      `.trim();
      const expectedOutput = {
        'head/0/0': 'My Page',
        'head/1#content': 'Page description',
        'body/0': 'some simple text without an html tag',
        'body/1/0': 'Hello, world!',
        'body/2/0': 'This is a paragraph with a',
        'body/2/1/0': 'link',
        'body/2/2': 'and',
        'body/2/3/0': 'bold and',
        'body/2/3/1/0': 'italic text',
        'body/2/4': '.'
      };

      mockFileOperations(input);

      const htmlLoader = createBucketLoader('html', 'i18n/[locale].html');
      htmlLoader.setDefaultLocale('en');
      const data = await htmlLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save html data', async () => {
      const input = `
<html>
  <head>
    <title>My Page</title>
    <meta name="description" content="Page description" />
  </head>
  <body>
    some simple text without an html tag
    <h1>Hello, world!</h1>
    <p>
      This is a paragraph with a <a href="https://example.com">link</a> and <b>bold and <i>italic text</i></b>
    </p>
  </body>
</html>
      `.trim();
      const payload = {
        'head/0/0': 'Mi Página',
        'head/1#content': 'Descripción de la página',
        'body/0': 'texto simple sin etiqueta html',
        'body/1/0': '¡Hola, mundo!',
        'body/2/0': 'Este es un párrafo con un ',
        'body/2/1/0': 'enlace',
        'body/2/2': ' y ',
        'body/2/3/0': 'texto en negrita y ',
        'body/2/3/1/0': 'texto en cursiva',
      };
      const expectedOutput = `
<html lang="es">
  <head>
    <title>Mi Página</title>
    <meta name="description" content="Descripción de la página" />
  </head>
  <body>
    texto simple sin etiqueta html
    <h1>¡Hola, mundo!</h1>
    <p>
      Este es un párrafo con un
      <a href="https://example.com">enlace</a>
      y
      <b>
        texto en negrita y
        <i>texto en cursiva</i>
      </b>
    </p>
  </body>
</html>
      `.trim() + '\n';

      mockFileOperations(input);

      const htmlLoader = createBucketLoader('html', 'i18n/[locale].html');
      htmlLoader.setDefaultLocale('en');
      await htmlLoader.pull('en');

      await htmlLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.html',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('json bucket loader', () => {
    it('should load json data', async () => {
      setupFileMocks();

      const input = { 'button.title': 'Submit' };
      mockFileOperations(JSON.stringify(input));

      const jsonLoader = createBucketLoader('json', 'i18n/[locale].json');
      jsonLoader.setDefaultLocale('en');
      const data = await jsonLoader.pull('en');

      expect(data).toEqual(input);
    });

    it('should save json data', async () => {
      setupFileMocks();

      const input = { 'button.title': 'Submit' };
      const payload = { 'button.title': 'Enviar' };
      const expectedOutput = JSON.stringify(payload, null, 2) + '\n';

      mockFileOperations(JSON.stringify(input));

      const jsonLoader = createBucketLoader('json', 'i18n/[locale].json');
      jsonLoader.setDefaultLocale('en');
      await jsonLoader.pull('en');

      await jsonLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.json',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('markdown bucket loader', () => {
    it('should load markdown data', async () => {
      setupFileMocks();

      const input = `---
title: Test Markdown
date: 2023-05-25
---

# Heading 1

This is a paragraph.

## Heading 2

Another paragraph with **bold** and *italic* text.`;
      const expectedOutput = {
        'fm-attr-title': 'Test Markdown',
        'fm-attr-date': '2023-05-25',
        'md-section-0': '# Heading 1',
        'md-section-1': 'This is a paragraph.',
        'md-section-2': '## Heading 2',
        'md-section-3': 'Another paragraph with **bold** and *italic* text.'
      };

      mockFileOperations(input);

      const markdownLoader = createBucketLoader('markdown', 'i18n/[locale].md');
      markdownLoader.setDefaultLocale('en');
      const data = await markdownLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save markdown data', async () => {
      setupFileMocks();

      const input = `---
title: Test Markdown
date: 2023-05-25
---

# Heading 1

This is a paragraph.

## Heading 2

Another paragraph with **bold** and *italic* text.`;
      const payload = {
        'fm-attr-title': 'Prueba Markdown',
        'fm-attr-date': '2023-05-25',
        'md-section-0': '# Encabezado 1',
        'md-section-1': 'Esto es un párrafo.',
        'md-section-2': '## Encabezado 2',
        'md-section-3': 'Otro párrafo con texto en **negrita** y en *cursiva*.'
      };
      const expectedOutput = `---
title: Prueba Markdown
date: 2023-05-25
---

# Encabezado 1

Esto es un párrafo.

## Encabezado 2

Otro párrafo con texto en **negrita** y en *cursiva*.
`;

      mockFileOperations(input);

      const markdownLoader = createBucketLoader('markdown', 'i18n/[locale].md');
      markdownLoader.setDefaultLocale('en');
      await markdownLoader.pull('en');

      await markdownLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.md',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('po bucket loader', () => {
    it('should load and handle various po data', async () => {
      setupFileMocks();

      const input = `
# This is a comment
msgid "greeting"
msgstr "Hello, {name}!"

msgid "farewell"
msgstr "Goodbye, {name}!"

# Another comment
msgid "empty"
msgstr ""
      `.trim();
      const expectedOutput = {
        greeting: 'Hello, {name}!',
        farewell: 'Goodbye, {name}!',
        empty: ''
      };

      mockFileOperations(input);

      const poLoader = createBucketLoader('po', 'i18n/[locale].po');
      poLoader.setDefaultLocale('en');
      const data = await poLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save po data with variable patterns and comments', async () => {
      setupFileMocks();

      const input = `
# This is a comment
msgid "greeting"
msgstr "Hello, {name}!"
      `.trim();
      const payload = {
        greeting: '¡Hola, {name}!',
        farewell: '¡Adiós, {name}!'
      };
      const expectedOutput = `
msgid "greeting"
msgstr "¡Hola, {name}!"

msgid "farewell"
msgstr "¡Adiós, {name}!"
      `.trim() + '\n';

      mockFileOperations(input);

      const poLoader = createBucketLoader('po', 'i18n/[locale].po');
      poLoader.setDefaultLocale('es');
      await poLoader.pull('es');

      await poLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.po',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('properties bucket loader', () => {
    it('should load properties data', async () => {
      setupFileMocks();

      const input = `
# General messages
welcome.message=Welcome to our application!
error.message=An error has occurred. Please try again later.

# User-related messages
user.login=Please enter your username and password.
user.username=Username
user.password=Password
      `.trim();
      const expectedOutput = {
        'welcome.message': 'Welcome to our application!',
        'error.message': 'An error has occurred. Please try again later.',
        'user.login': 'Please enter your username and password.',
        'user.username': 'Username',
        'user.password': 'Password'
      };

      mockFileOperations(input);

      const propertiesLoader = createBucketLoader('properties', 'i18n/[locale].properties');
      propertiesLoader.setDefaultLocale('en');
      const data = await propertiesLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save properties data', async () => {
      setupFileMocks();

      const input = `
# General messages
welcome.message=Welcome to our application!
error.message=An error has occurred. Please try again later.

# User-related messages
user.login=Please enter your username and password.
user.username=Username
user.password=Password
      `.trim();
      const payload = {
        'welcome.message': 'Bienvenido a nuestra aplicación!',
        'error.message': 'Se ha producido un error. Por favor, inténtelo de nuevo más tarde.',
        'user.login': 'Por favor, introduzca su nombre de usuario y contraseña.',
        'user.username': 'Nombre de usuario',
        'user.password': 'Contraseña'
      };
      const expectedOutput = `
welcome.message=Bienvenido a nuestra aplicación!
error.message=Se ha producido un error. Por favor, inténtelo de nuevo más tarde.
user.login=Por favor, introduzca su nombre de usuario y contraseña.
user.username=Nombre de usuario
user.password=Contraseña
      `.trim() + '\n';

      mockFileOperations(input);

      const propertiesLoader = createBucketLoader('properties', 'i18n/[locale].properties');
      propertiesLoader.setDefaultLocale('en');
      await propertiesLoader.pull('en');

      await propertiesLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.properties',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('xcode-strings bucket loader', () => {
    it('should load xcode-strings', async () => {
      setupFileMocks();

      const input = `
"key1" = "value1";
"key2" = "value2";
"key3" = "Line 1\\nLine 2\\"quoted\\"";
      `.trim();
      const expectedOutput = {
        key1: 'value1',
        key2: 'value2',
        key3: 'Line 1\nLine 2"quoted"'
      };

      mockFileOperations(input);

      const xcodeStringsLoader = createBucketLoader('xcode-strings', 'i18n/[locale].strings');
      xcodeStringsLoader.setDefaultLocale('en');
      const data = await xcodeStringsLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save xcode-strings', async () => {
      setupFileMocks();

      const input = `
"hello" = "Hello!";
      `.trim();
      const payload = { hello: '¡Hola!' };
      const expectedOutput = `"hello" = "¡Hola!";\n`;

      mockFileOperations(input);

      const xcodeStringsLoader = createBucketLoader('xcode-strings', 'i18n/[locale].strings');
      xcodeStringsLoader.setDefaultLocale('en');
      await xcodeStringsLoader.pull('en');

      await xcodeStringsLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.strings',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('xcode-stringsdict bucket loader', () => {
    it('should load xcode-stringsdict', async () => {
      setupFileMocks();

      const input = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>greeting</key>
  <string>Hello!</string>
  <key>items_count</key>
  <dict>
    <key>NSStringLocalizedFormatKey</key>
    <string>%#@items@</string>
    <key>items</key>
    <dict>
      <key>NSStringFormatSpecTypeKey</key>
      <string>NSStringPluralRuleType</string>
      <key>NSStringFormatValueTypeKey</key>
      <string>d</string>
      <key>one</key>
      <string>%d item</string>
      <key>other</key>
      <string>%d items</string>
    </dict>
  </dict>
</dict>
</plist>
      `.trim();
      const expectedOutput = {
        greeting: 'Hello!',
        'items_count/NSStringLocalizedFormatKey': '%#@items@',
        'items_count/items/NSStringFormatSpecTypeKey': 'NSStringPluralRuleType',
        'items_count/items/NSStringFormatValueTypeKey': 'd',
        'items_count/items/one': '%d item',
        'items_count/items/other': '%d items'
      };

      mockFileOperations(input);

      const xcodeStringsdictLoader = createBucketLoader('xcode-stringsdict', 'i18n/[locale].stringsdict');
      xcodeStringsdictLoader.setDefaultLocale('en');
      const data = await xcodeStringsdictLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save xcode-stringsdict', async () => {
      setupFileMocks();

      const input = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>greeting</key>
    <string>Hello!</string>
  </dict>
</plist>
      `.trim();
      const payload = { greeting: '¡Hola!' };
      const expectedOutput = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>greeting</key>
    <string>¡Hola!</string>
  </dict>
</plist>
      `.trim() + '\n';

      mockFileOperations(input);

      const xcodeStringsdictLoader = createBucketLoader('xcode-stringsdict', '[locale].lproj/Localizable.stringsdict');
      xcodeStringsdictLoader.setDefaultLocale('en');
      await xcodeStringsdictLoader.pull('en');

      await xcodeStringsdictLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'es.lproj/Localizable.stringsdict',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('xcode-xcstrings bucket loader', () => {
    it('should load xcode-xcstrings', async () => {
      setupFileMocks();

      const input = JSON.stringify({
        "version": "1.0",
        "sourceLanguage": "en",
        "strings": {
          "greeting": {
            "extractionState": "manual",
            "localizations": {
              "en": {
                "stringUnit": {
                  "state": "translated",
                  "value": "Hello!"
                }
              }
            }
          }
        }
      });
      const expectedOutput = { greeting: 'Hello!' };

      mockFileOperations(input);

      const xcodeXcstringsLoader = createBucketLoader('xcode-xcstrings', 'Localizable.xcstrings');
      xcodeXcstringsLoader.setDefaultLocale('en');
      const data = await xcodeXcstringsLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save xcode-xcstrings', async () => {
      setupFileMocks();

      const input = JSON.stringify({
        "version": "1.0",
        "sourceLanguage": "en",
        "strings": {
          "greeting": {
            "extractionState": "manual",
            "localizations": {
              "en": {
                "stringUnit": {
                  "state": "translated",
                  "value": "Hello!"
                }
              }
            }
          }
        }
      });
      const payload = { greeting: '¡Hola!' };
      const expectedOutput = JSON.stringify({
        version: '1.0',
        sourceLanguage: 'en',
        strings: {
          greeting: {
            extractionState: 'manual',
            localizations: {
              en: {
                stringUnit: { state: 'translated', value: 'Hello!' }
              },
              es: {
                stringUnit: { state: 'translated', value: '¡Hola!' }
              }
            }
          }
        }
      }, null, 2) + '\n';

      mockFileOperations(input);

      const xcodeXcstringsLoader = createBucketLoader('xcode-xcstrings', 'Localizable.xcstrings');
      xcodeXcstringsLoader.setDefaultLocale('en');
      await xcodeXcstringsLoader.pull('en');

      await xcodeXcstringsLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'Localizable.xcstrings',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('yaml bucket loader', () => {
    it('should load yaml', async () => {
      setupFileMocks();

      const input = `
        greeting: Hello!
      `.trim();
      const expectedOutput = { greeting: 'Hello!' };

      mockFileOperations(input);

      const yamlLoader = createBucketLoader('yaml', 'i18n/[locale].yaml');
      yamlLoader.setDefaultLocale('en');
      const data = await yamlLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save yaml', async () => {
      setupFileMocks();

      const input = `
        greeting: Hello!
      `.trim();
      const payload = { greeting: '¡Hola!' };
      const expectedOutput = `greeting: ¡Hola!\n`;

      mockFileOperations(input);

      const yamlLoader = createBucketLoader('yaml', 'i18n/[locale].yaml');
      yamlLoader.setDefaultLocale('en');
      await yamlLoader.pull('en');

      await yamlLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.yaml',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });

  describe('yaml-root-key bucket loader', () => {
    it('should load yaml-root-key', async () => {
      setupFileMocks();

      const input = `
      en:
        greeting: Hello!
    `.trim();
      const expectedOutput = { greeting: 'Hello!' };

      mockFileOperations(input);

      const yamlRootKeyLoader = createBucketLoader('yaml-root-key', 'i18n/[locale].yaml');
      yamlRootKeyLoader.setDefaultLocale('en');
      const data = await yamlRootKeyLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });

    it('should save yaml-root-key', async () => {
      setupFileMocks();

      const input = `
      en:
        greeting: Hello!
    `.trim();
      const payload = { greeting: '¡Hola!' };
      const expectedOutput = `es:\n  greeting: ¡Hola!\n`;

      mockFileOperations(input);

      const yamlRootKeyLoader = createBucketLoader('yaml-root-key', 'i18n/[locale].yaml');
      yamlRootKeyLoader.setDefaultLocale('en');
      await yamlRootKeyLoader.pull('en');

      await yamlRootKeyLoader.push('es', payload);

      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.yaml',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });
  describe('XML bucket loader', () => {
    it('should load XML data', async () => {
      setupFileMocks();
  
      const input = `<root>
    <title>Test XML</title>
    <date>2023-05-25</date>
    <content>
      <section>Introduction</section>
      <section>
        <text>
          Detailed text. 
        </text>
      </section>
    </content>
  </root>`;
  
      const expectedOutput = {
        'root/title': 'Test XML',
        'root/date': '2023-05-25',
        'root/content/section/0': 'Introduction',
        'root/content/section/1/text': 'Detailed text.',
      };
  
      mockFileOperations(input);
  
      const xmlLoader = createBucketLoader("xml", 'i18n/[locale].xml');
      xmlLoader.setDefaultLocale('en');
      const data = await xmlLoader.pull('en');      
      expect(data).toEqual(expectedOutput);
    });
  
    it('should save XML data', async () => {
      setupFileMocks();
  
      const input = `<root>
    <title>Test XML</title>
    <date>2023-05-25</date>
    <content>
      <section>Introduction</section>
      <section>
        <text>
          Detailed text.
        </text>
      </section>
    </content>
  </root>`;
  
      const payload = {
        'root/title': 'Prueba XML',
        'root/date': '2023-05-25',
        'root/content/section/0': 'Introducción',
        'root/content/section/1/text': 'Detalles texto.',
      };
  
      let expectedOutput = `
      <root>
        <title>Prueba XML</title>
        <date>2023-05-25</date>
        <content>
          <section>Introducción</section>
          <section>
            <text>Detalles texto.</text>
          </section>
        </content>
      </root>`.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
      mockFileOperations(input);
      expectedOutput+="\n";
      const xmlLoader = createBucketLoader("xml", 'i18n/[locale].xml');
      xmlLoader.setDefaultLocale('en');
      await xmlLoader.pull('en');
  
      await xmlLoader.push('es', payload);
  
      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.xml',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' },
      );
    });
  });
  
  describe('srt bucket loader', () => {
    it('should load srt', async () => {
      setupFileMocks();
  
      const input = `
1
00:00:00,000 --> 00:00:01,000
Hello!

2
00:00:01,000 --> 00:00:02,000
World!
      `.trim();
      const expectedOutput = {"1#00:00:00,000-00:00:01,000": "Hello!","2#00:00:01,000-00:00:02,000": "World!"};
  
      mockFileOperations(input);
  
      const srtLoader = createBucketLoader('srt', 'i18n/[locale].srt');
      srtLoader.setDefaultLocale('en');
      const data = await srtLoader.pull('en');
  
      expect(data).toEqual(expectedOutput);
    });


      it('should save srt', async () => {
        setupFileMocks();
    
        const input = `
1
00:00:00,000 --> 00:00:01,000
Hello!

2
00:00:01,000 --> 00:00:02,000
World!
  `.trim();
  
        const payload = {"1#00:00:00,000-00:00:01,000": "¡Hola!","2#00:00:01,000-00:00:02,000": "Mundo!"}
        
        const expectedOutput = `1
00:00:00,000 --> 00:00:01,000
¡Hola!

2
00:00:01,000 --> 00:00:02,000
Mundo!\n`;

    
      mockFileOperations(input);

      const srtLoader = createBucketLoader('srt', 'i18n/[locale].srt');
      srtLoader.setDefaultLocale('en');
      await srtLoader.pull('en');

      await srtLoader.push('es', payload);
    
        expect(fs.writeFile).toHaveBeenCalledWith(
          'i18n/es.srt',
          expectedOutput,
          { encoding: 'utf-8', flag: 'w' },
        );
      });
  
  });

  describe('xliff bucket loader', () => {
    it('should load xliff data', async () => {
      setupFileMocks();
  
      const input = `
  <xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="en-US">
    <file id="namespace1">
      <unit id="key1">
        <segment>
          <source>Hello</source>
        </segment>
      </unit>
      <unit id="key2">
        <segment>
          <source>An application to manipulate and process XLIFF documents</source>
        </segment>
      </unit>
      <unit id="key.nested">
        <segment>
          <source>XLIFF Data Manager</source>
        </segment>
      </unit>
      <group id="group">
        <unit id="groupUnit">
          <segment>
            <source>Group</source>
          </segment>
        </unit>
      </group>
    </file>
  </xliff>
      `.trim();
      
      const expectedOutput =  {
        "resources/namespace1/group/groupUnits/groupUnit/source": "Group","resources/namespace1/key.nested/source": "XLIFF Data Manager","resources/namespace1/key1/source": "Hello",
        "resources/namespace1/key2/source": "An application to manipulate and process XLIFF documents",
        "sourceLanguage": "en-US",
          };
  
          mockFileOperations(input);
          
          const xliffLoader = createBucketLoader('xliff', 'i18n/[locale].xliff');
          xliffLoader.setDefaultLocale('en');
          const data = await xliffLoader.pull('en');
          
          expect(data).toEqual(expectedOutput);
        });
        
        it('should save xliff data', async () => {
          setupFileMocks();
          
        const input = `
    <xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="en-US">
      <file id="namespace1">
        <unit id="key1">
          <segment>
            <source>Hello</source>
          </segment>
        </unit>
        <unit id="key2">
          <segment>
            <source>An application to manipulate and process XLIFF documents</source>
          </segment>
        </unit>
        <unit id="key.nested">
          <segment>
            <source>XLIFF Data Manager</source>
          </segment>
        </unit>
        <group id="group">
          <unit id="groupUnit">
            <segment>
              <source>Group</source>
            </segment>
          </unit>
        </group>
      </file>
    </xliff>
        `.trim();
        const payload =  {
          "resources":  {
            "namespace1":  {
              "group":  {
                "groupUnits":  {
                  "groupUnit":  {
                    "source": "Grupo",
                  },
                },
              },
              "key.nested":  {
                "source": "Administrador de Datos XLIFF",
              },
              "key1":  {
                "source": "Hola",
              },
              "key2":  {
                "source": "Una aplicación para manipular y procesar documentos XLIFF",
              },
            },
          },
          "sourceLanguage": "es-ES",
        };
        
    
        const expectedOutput = `
<xliff xmlns="urn:oasis:names:tc:xliff:document:2.0" version="2.0" srcLang="es-ES">
  <file id="namespace1">
    <unit id="key1">
      <segment>
        <source>Hola</source>
      </segment>
    </unit>
    <unit id="key2">
      <segment>
        <source>Una aplicación para manipular y procesar documentos XLIFF</source>
      </segment>
    </unit>
    <unit id="key.nested">
      <segment>
        <source>Administrador de Datos XLIFF</source>
      </segment>
    </unit>
    <group id="group">
      <unit id="groupUnit">
        <segment>
          <source>Grupo</source>
        </segment>
      </unit>
    </group>
  </file>
</xliff>`.trim()+"\n";

  
      mockFileOperations(input);
  
      const xliffLoader = createBucketLoader('xliff', 'i18n/[locale].xlf');
      xliffLoader.setDefaultLocale('en');
      await xliffLoader.pull('en');
  
      await xliffLoader.push('es', payload);
  
      expect(fs.writeFile).toHaveBeenCalledWith(
        'i18n/es.xlf',
        expectedOutput,
        { encoding: 'utf-8', flag: 'w' }
        )
      })
  })
  

});

// Helper functions
function setupFileMocks() {
  // Mock fs/promises
  vi.mock('fs/promises', () => ({
    default: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      access: vi.fn(),
    },
  }));

  // Mock path
  vi.mock('path', () => ({
    default: {
      resolve: vi.fn(path => path),
      dirname: vi.fn(path => path.split('/').slice(0, -1).join('/')),
    },
  }));
}

function mockFileOperations(input: string) {
  (fs.access as any).mockImplementation(() => Promise.resolve());
  (fs.readFile as any).mockImplementation(() => Promise.resolve(input));
  (fs.writeFile as any).mockImplementation(() => Promise.resolve());
}
