import { Command } from "commander";
import Ora from 'ora';
import express from 'express';
import cors from 'cors';
import open from 'open';
import readline from 'readline/promises';
import { loadSettings } from "./services/settings.js";
import { getEnv } from "./services/env.js";
import { checkAuth } from "./services/check-auth.js";
import { saveApiKey } from "./services/api-key.js";

export default new Command()
  .command("auth")
  .description("Authenticate with Replexica API")
  .helpOption("-h, --help", "Show help")
  .option("--logout", "Delete existing authentication")
  .option("--login", "Authenticate with Replexica API")
  .action(async (options) => {
    try {
      const env = getEnv();
      let config = await loadSettings();
  
      if (options.logout) {
        await logout();
      }
      if (options.login) {
        await login(env.REPLEXICA_WEB_URL);
        config = await loadSettings();
      }
  
      await checkAuth();
    } catch (error: any) {
      Ora().fail(error.message);
      process.exit(1);
    }
  });

async function logout() {
  const spinner = Ora().start('Logging out');
  await saveApiKey(null);
  spinner.succeed('Logged out');
}

async function login(apiUrl: string) {
  await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }).question('Press Enter to open the browser for authentication\n');

  const spinner = Ora().start('Waiting for the API key');
  const apiKey = await waitForApiKey(async (port) => {
    await open(`${apiUrl}/app/cli?port=${port}`, { wait: false });
  });
  spinner.succeed('API key received');
  await saveApiKey(apiKey);
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
