import { Command } from "commander";
import Ora from 'ora';
import express from 'express';
import cors from 'cors';
import open from 'open';
import readline from 'readline/promises';
import { loadSettings, saveSettings } from "./services/settings.js";
import { loadAuth } from "./services/auth.js";

export default new Command()
  .command("auth")
  .description("Authenticate with Replexica API")
  .helpOption("-h, --help", "Show help")
  .option("--logout", "Delete existing authentication")
  .option("--login", "Authenticate with Replexica API")
  .action(async (options) => {
    try {
      let settings = await loadSettings();
  
      if (options.logout) {
        settings.auth.apiKey = null;
        await saveSettings(settings);
      }
      if (options.login) {
        const apiKey = await login(settings.auth.apiUrl);
        settings.auth.apiKey = apiKey;
        await saveSettings(settings);
        settings = await loadSettings();
      }
  
      const auth = await loadAuth({
        apiUrl: settings.auth.apiUrl,
        apiKey: settings.auth.apiKey!,
      });
      if (!auth) {
        Ora().warn('Not authenticated');
      } else {
        Ora().succeed(`Authenticated as ${auth.email}`);
      }
    } catch (error: any) {
      Ora().fail(error.message);
      process.exit(1);
    }
  });

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

  return apiKey;
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
