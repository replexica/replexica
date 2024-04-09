import { Command } from "commander";
import os from "os";
import fs from "fs";
import path from "path";
import Ora from 'ora';
import Z from 'zod';
import Ini from 'ini';
import { input } from '@inquirer/prompts';

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
  .action(async () => {
    const spinner = Ora("Authenticating with Replexica");

    spinner.info("Checking for existing authentication");
    let credentials = await loadConfig();
    if (!credentials) {
      spinner.info("No existing authentication found. Authenticating with Replexica");
      spinner.info('Free account will be created if you do not yet have one.');
      const email = await input({
        message: 'Enter your email address:',
        validate(value) {
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          return isValidEmail || 'Please enter a valid email address';
        },
      });
      spinner.start(`Sending a magic link to ${email}. Please check your email and click the link to authenticate.`);
      const apiKey = await waitForApiKey(email);
      spinner.info("Received API key from Replexica");
      credentials = { auth: { apiKey } };
      await saveConfig(credentials);
    } else {
      spinner.info("Already authenticated with Replexica");
    }

    spinner.start();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spinner.succeed("Authenticated with Replexica");
  });

async function waitForApiKey(email: string) {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('1234567890');
    }, 2000);
  });
}

async function loadConfig() {
  const authFileExists = fs.existsSync(settingsFilePath);
  if (!authFileExists) { return null; }

  const fileContents = fs.readFileSync(settingsFilePath, "utf8");
  const parsed = Ini.parse(fileContents);
  const result = ConfigFileSchema.parse(parsed);
  return result;
}

async function saveConfig(config: Z.infer<typeof ConfigFileSchema>) {
  const serialized = Ini.stringify(config);
  fs.writeFileSync(settingsFilePath, serialized);
}
