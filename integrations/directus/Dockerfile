FROM directus/directus:11

USER root

RUN npm install -g pnpm@latest

USER node

# Install the integration
RUN pnpm install @replexica/integration-directus
