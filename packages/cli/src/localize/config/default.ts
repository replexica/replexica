import { ConfigSchema } from "./schema.js";

const DEMO_DIRECTORY_NAME = 'replexica-demo';
export const defaultPaths = {
  config: '.replexica/config.yml',
  dictionaryEn: `${DEMO_DIRECTORY_NAME}/en.json`,
  dictionaryPattern: `${DEMO_DIRECTORY_NAME}/[lang].json`,
  githubWorkflow: '.github/workflows/replexica.yml',
};

export const defaultConfig: ConfigSchema = {
  version: 1,
  languages: { source: 'en', target: ['es'] },
  projects: [
    { name: 'demo', type: 'json', path: defaultPaths.dictionaryPattern },
  ],
};


export const defaultGithubWorkflow = {
  name: 'Replexica',
  on: {
    workflow_dispatch: null,
    push: { branches: ['main'] },
    pull_request: { branches: ['main'] },
  },
  permissions: {
    contents: 'write',
    'pull-requests': 'write',
    checks: 'write',
    actions: 'write',
    issues: 'write',
  },
  jobs: {
    localize: {
      'runs-on': 'ubuntu-latest',
      'steps': [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v2',
        },
        {
          name: 'Replexica',
          uses: 'replexica/github-action@main',
          env: {
            REPLEXICA_API_KEY: '${{ secrets.REPLEXICA_API_KEY }}',
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
        },
      ],
    },
  },
};

export const demoEnDictionary = {
  'home.title': 'Replexica',
  'home.description': 'Replexica is an AI-powered localization-as-a-service platform for modern SaaS.',
};
