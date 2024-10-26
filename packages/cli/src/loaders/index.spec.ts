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
    it('should load android data from xml file', async () => {
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
  });

  describe('csv bucket loader', () => {
    it('should load csv data from csv file', async () => {
      setupFileMocks();

      const input = `id,en\nbutton.title,Submit`;
      const expectedOutput = { 'button.title': 'Submit' };

      mockFileOperations(input);

      const csvLoader = createBucketLoader('csv', 'i18n.csv');
      csvLoader.setDefaultLocale('en');
      const data = await csvLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });
  });

  describe('html bucket loader', () => {
    it('should load html data from html file', async () => {
      setupFileMocks();

      const input = `
        <html>
          <head>
            <title>My Page</title>
            <meta name="description" content="Page description">
          </head>
          <body>
           no tag 
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
      // Keys are XPath expressions
      const expectedOutput = {
        'head/0': 'My Page',
        'head/1#content': 'Page description',
        'body/0': 'no tag',
        'body/1': 'Hello, world!',
        'body/2/0': 'This is a paragraph with a',
        'body/2/1': 'link',
        'body/2/2': 'and',
        'body/2/3/0': 'bold and ',
        'body/2/3/1': 'italic text',
        'body/2/4': '.'
      };

      mockFileOperations(input);

      const htmlLoader = createBucketLoader('html', 'i18n/[locale].html');
      htmlLoader.setDefaultLocale('en');
      const data = await htmlLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });
  });

  describe('json bucket loader', () => {
    it('should load json data from plain json text file', async () => {
      setupFileMocks();

      const input = { 'button.title': 'Submit' };
      mockFileOperations(JSON.stringify(input));

      const jsonLoader = createBucketLoader('json', 'i18n/[locale].json');
      jsonLoader.setDefaultLocale('en');
      const data = await jsonLoader.pull('en');
      
      expect(data).toEqual(input);
    });
  });

  describe('markdown bucket loader', () => {
    it('should load markdown data from markdown file', async () => {
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
    });
  });

  describe('properties bucket loader', () => {
    it('should load properties data from properties file', async () => {
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
  });

  describe('xcode-strings bucket loader', () => {
    it('should load xcode-strings data from xcode-strings file', async () => {
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
  });

  describe('xcode-stringsdict bucket loader', () => {
    it('should load xcode-stringsdict data from xcode-stringsdict file', async () => {
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
  });

  describe('xcode-xcstrings bucket loader', () => {
    it('should load xcode-xcstrings data from xcode-xcstrings file', async () => {
      setupFileMocks();

      const input = JSON.stringify({
        "sourceLanguage" : "en",
        "strings" : {
          "greeting" : {
            "extractionState" : "manual",
            "localizations" : {
              "en" : {
                "stringUnit" : {
                  "state" : "translated",
                  "value" : "Hello!"
                }
              }
            }
          }
        },
        "version" : "1.0"
      });
      const expectedOutput = { greeting: 'Hello!' };

      mockFileOperations(input);

      const xcodeXcstringsLoader = createBucketLoader('xcode-xcstrings', 'i18n/Localizable.xcstrings');
      xcodeXcstringsLoader.setDefaultLocale('en');
      const data = await xcodeXcstringsLoader.pull('en');

      expect(data).toEqual(expectedOutput);
    });
  });

  describe('yaml bucket loader', () => {
    it('should load yaml data from yaml file', async () => {
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

  describe('yaml-root-key bucket loader', () => {
    it('should load yaml-root-key data from yaml-root-key file', async () => {
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
  });
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
}
