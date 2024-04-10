import { Command } from "commander";
import os from "os";
import fs from "fs";
import path from "path";
import Ora from 'ora';
import Z from 'zod';
import Ini from 'ini';
import express from 'express';
import cors from 'cors';
import open from 'open';
import readline from 'readline/promises';

const settingsFile = ".replexicarc";
const homedir = os.homedir();
const settingsFilePath = path.join(homedir, settingsFile);

const ConfigFileSchema = Z.object({
  auth: Z.object({
    apiKey: Z.string(),
  }),
});

export default new Command()
  .command("auth")
  .description("Authenticate with Replexica")
  .helpOption("-h, --help", "Show help")
  .option("-d, --delete", "Delete existing authentication")
  .option("-f, --force", "Force re-authentication")
  .action(async (options) => {
    if (options.delete) {
      await logout();
    } else if (options.force) {
      await logout();
      await login();
    } else {
      await login();
    }
  });

async function logout() {
  const spinner = Ora().start('Logging out');
  await deleteSettings();
  spinner.succeed('Logged out');
}

async function login() {
  const settingsSpinner = Ora().start('Loading settings');
  let config = await loadSettings();
  settingsSpinner.succeed('Settings loaded');
  if (config?.auth.apiKey) {
    // We have the config file so we make a request to the API to retrieve the user's email
    // and display it to the user. If the apikey is invalid, we delete the config file,
    // display the warning message and ask for the email.
    const statusSpinner = Ora().start('Checking auth status');
    const whoami = await fetchWhoami(config.auth.apiKey);
    if (whoami?.email) {
      statusSpinner.succeed(`Logged in as ${whoami.email}`);
      return;
    } else {
      statusSpinner.warn(`Couldn't check auth status.`);
      config = await deleteSettings();
    }
  }
  
  if (!config?.auth.apiKey) {
    // No config file, so we need to ask for the email,
    // launch a listener on a ephemeral port, trigger the magic email link sending,
    // and wait for the API key to be sent back.
    await readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    }).question('Press Enter to open the browser');
    const loginSpinner = Ora().start('Waiting for the API key');
    const apiKey = await waitForApiKey(async (port) => {
      await open(`https://replexica.com/app/cli?port=${port}`, { wait: false });
    });
    loginSpinner.succeed('API key received');

    const saveSpinner = Ora().start('Saving settings');
    config = {
      auth: {
        apiKey,
      },
    };
    await saveSettings(config);
    saveSpinner.succeed('Settings saved');

    const statusSpinner = Ora().start('Checking auth status');
    const whoami = await fetchWhoami(apiKey);
    statusSpinner.succeed(`Logged in as ${whoami.email}`);
  }
}

async function fetchWhoami(apiKey: string) {
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

async function loadSettings() {
  const authFileExists = fs.existsSync(settingsFilePath);
  if (!authFileExists) { return null; }

  const fileContents = fs.readFileSync(settingsFilePath, "utf8");
  const parsed = Ini.parse(fileContents);
  const result = ConfigFileSchema.parse(parsed);
  return result;
}

async function saveSettings(config: Z.infer<typeof ConfigFileSchema>) {
  const serialized = Ini.stringify(config);
  fs.writeFileSync(settingsFilePath, serialized);
}

async function deleteSettings() {
  const authFileExists = fs.existsSync(settingsFilePath);
  if (!authFileExists) { return null; }

  fs.rmSync(settingsFilePath);
  return null;
}