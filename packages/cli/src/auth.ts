import { Command } from "commander";
import Ora from 'ora';
import express from 'express';
import cors from 'cors';
import open from 'open';
import readline from 'readline/promises';
import { getEnv } from './services/env.js';
import { loadSettings, saveSettings } from "./services/settings.js";

export default new Command()
  .command("auth")
  .description("Authenticate with Replexica API")
  .helpOption("-h, --help", "Show help")
  .option("-d, --delete", "Delete existing authentication")
  .option("-l, --login", "Authenticate with Replexica API")
  .action(async (options) => {
    if (options.delete) {
      await logout();
    }
    if (options.login) {
      await login();
    }
    await checkLogin();
  });

async function checkLogin() {
  const spinner = Ora().start('Checking login status');
  const apiKey = await loadApiKey();

  const env = await getEnv();
  const finalApiKey = env.REPLEXICA_API_KEY || apiKey;
  const isFinalApiKeyFromEnv = !!env.REPLEXICA_API_KEY;

  const whoami = await fetchWhoami(finalApiKey);
  if (!whoami) {
    spinner.warn('Not logged in');
    return;
  }
  
  let message = `Logged in as ${whoami.email}`;
  if (isFinalApiKeyFromEnv) {
    message += ' (from env var)';
  }
  spinner.succeed(message);
}

async function logout() {
  const spinner = Ora().start('Logging out');
  await saveApiKey(null);
  spinner.succeed('Logged out');
}

async function login() {
  await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }).question('Press Enter to open the browser and authenticate');

  const spinner = Ora().start('Waiting for the API key');
  const apiKey = await waitForApiKey(async (port) => {
    await open(`http://localhost:8788/app/cli?port=${port}`, { wait: false });
  });
  spinner.succeed('API key received');
  await saveApiKey(apiKey);
}

async function fetchWhoami(apiKey: string | null) {
  const res = await fetch(`https://engine.replexica.com/whoami`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ContentType: "application/json",
    },
  });

  if (res.ok) {
    return res.json();
  }

  return null;
}

async function waitForApiKey(cb: (port: string) => void): Promise<string> {
  // start a sever on an ephemeral port and return the port number
  // from the function
  const app = express();
  app.use(express.json());
  app.use(cors());

  return new Promise((resolve) => {
    const server = app.listen(0, async () => {
      const port = (server.address() as any).port;
      cb(port.toString());
    });

    app.post("/", (req, res) => {
      const apiKey = req.body.apiKey;
      res.end();
      server.close(() => {
        resolve(apiKey);
      });
    });
  });
}

async function loadApiKey() {
  const settings = await loadSettings();
  return settings.auth.apiKey || null;
}

async function saveApiKey(apiKey: string | null) {
  const settings = await loadSettings();
  settings.auth.apiKey = apiKey;
  await saveSettings(settings);
}
