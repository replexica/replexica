# Replexica Integration for Directus

This is the official Replexica integration for [Directus](https://directus.io), a headless CMS, enabling automated AI-powered localization within your Directus workflow.

## Overview

This integration adds a Replexica operation to Directus CMS that allows you to automatically translate content across 80+ languages using Replexica's AI localization engine.

## Configuration

1. Install Replexica Extension in your Directus project
2. Create a new Flow in Directus with Replexica Extension
3. Run the Flow to localize content

## 1. Set up Replexica Extension

This section is based on the [Directus documentation for installing extensions via the npm registry](https://docs.directus.io/extensions/installing-extensions.html#installing-via-the-npm-registry).

### Modify `docker-compose.yml`

Open the `docker-compose.yml` file of your project and replace the `image` option with a `build` section:

- remove the `image` option:

```yaml
image: directus/directus:11.x.y
```

- add the `build` section:

```yaml
build:
  context: ./
```

This allows you to build a customized Docker Image with the added extensions.

### Create a `Dockerfile`

At the root of your project, create a `Dockerfile` if one doesn't already exist and add the following:

```Dockerfile
FROM directus/directus:11.x.y

USER root
RUN corepack enable
USER node

RUN pnpm install @replexica/integration-directus
```

### Build the Docker Image

Build your Docker image:

```bash
docker compose build
```

### Start the Docker Container

Start your Docker container:

```bash
docker compose up
```

On startup, Directus will automatically load any extension installed in the previous steps.

## 2. Create a New Flow

1. Navigate to the Flows section in Directus CMS.
2. Create a new Flow

![Create Flow](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/create-flow.png)

3. Select a Manual trigger, check collections to apply to, and Save.

![Select Trigger](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/create-new-flow-trigger.png)

4. Add Confirmation dialog with Target Languages and Save.

![Add Confirmation Dialog](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/confirmation-dialog.png)

5. Click '+' to add a new operation and select Replexica Integration for Directus.

![Add Operation](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/replexica-operation.png)

6. Configure the operation with the required parameters.

![Configure Operation](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/replexica-operation-settings.png)

7. Save the Flow.

## 3. Run the Flow

Go to Content and run the Flow on the collection to localize your content.

![Run Flow](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/run-flow.png)

## Results

The Flow will automatically translate the content in the selected collection.

![Flow Results](https://nlugbbdqxnqwhydszieg.supabase.co/storage/v1/object/public/replexica-integration-directus/flow-results.png)

## Replexica Extension Inputs

The integration provides a Directus operation that accepts the following parameters:

- `item_id`: The ID of the item to translate
- `collection`: The collection containing the content
- `translation_table`: The table storing translations
- `language_table`: The table containing supported languages
- `replexica_api_key`: Your Replexica API key
- `source_language`: Source language code (defaults to 'en-US')
- `target_languages`: Array of target language codes (example: ['fr-FR', 'de-DE'])

## Development

To run the integration locally:

```bash
# Clone the repo
git clone https://github.com/replexica/replexica

# Install dependencies
cd integrations/directus
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Run tests
pnpm test
```

The integration can be tested using the included Docker setup:

```bash
docker-compose up
```

This will start Directus at [http://localhost:8055](http://localhost:8055).

## License

[Apache-2.0](./LICENSE)

## More Information

- [Replexica Documentation](https://docs.replexica.com)
- [Directus Extensions Guide](https://docs.directus.io/extensions/operations)
- [GitHub Repository](https://github.com/replexica/replexica)

## Support

For questions and support:

- [Replexica Discord](https://replexica.com/go/discord)
- Email: <veronica@replexica.com>
