# Replexica SDK

This package is part of the [Replexica](https://github.com/replexica/replexica) project, an i18n toolkit designed to help you ship multi-language applications quickly and efficiently.

## Overview

The Replexica SDK provides a streamlined interface to interact with the Replexica AI Localization Real-Time API. It simplifies the process of integrating advanced localization capabilities into your applications, enabling you to build sophisticated multilingual experiences with ease.

## Features

- **Easy API Access**: Provides a simple and intuitive way to interact with the Replexica AI Localization Real-Time API.
- **Efficient Chunking**: Automatically handles payload chunking for optimal API usage.
- **Progress Tracking**: Offers built-in progress reporting for long-running localization tasks.
- **Error Handling**: Robust error handling for API interactions.
- **Flexible Configuration**: Customizable settings for API endpoints, batch sizes, and more.

## Use Cases

The Replexica SDK is versatile and can be used in various scenarios, including:

- Building multilingual chat applications
- Developing next-generation email clients with real-time translation
- Creating comment systems with on-the-fly localization
- Any application requiring real-time or batch localization of content

## Installation

```bash
npm install @replexica/sdk
```

## Usage

```javascript
/*
  For the sake of this example,
  we're assuming that REPLEXICA_API_KEY is stored in a .env file.
*/
import dotenv from 'dotenv';
dotenv.config();

// Import the Replexica SDK
import { ReplexicaEngine } from '@replexica/sdk';

// Initialize the Replexica Engine SDK
const replexica = new ReplexicaEngine({
  apiKey: process.env.REPLEXICA_API_KEY, // Your Replexica API key, obtained from the Replexica.com dashboard
});

// Localize a JSON payload
const localizedContent = await replexica.localizeObject(
  { myKey: 'Hello, world!' },
  { sourceLocale: 'en', targetLocale: 'es' },
  (progress) => console.log(`Localization progress: ${progress}%`) // Optional progress callback
);

// Output the localized content
console.log(localizedContent);
```

For more detailed usage instructions and API documentation, please refer to the [Replexica documentation](https://docs.replexica.com).

## Contributing

Contributions to the Replexica SDK are welcome. If you would like to contribute, please review our [contributing guidelines](https://github.com/replexica/replexica/blob/main/CONTRIBUTING.md) for detailed instructions.

## License

The Replexica SDK inherits its license from the root of the Replexica repository. For the most up-to-date licensing information, please refer to the [LICENSE](https://github.com/replexica/replexica/blob/main/LICENSE) file in the root of the Replexica repository.

For more information about Replexica and its ecosystem, please visit the main [Replexica repository](https://github.com/replexica/replexica).
