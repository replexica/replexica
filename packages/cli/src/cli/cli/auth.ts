import { Command } from "interactive-commander";
import Ora from "ora";
import express from "express";
import cors from "cors";
import open from "open";
import readline from "readline/promises";
import { getSettings, saveSettings } from "../utils/settings";
import { createAuthenticator } from "../utils/auth";

export default new Command()
  .command("auth")
  .description("Authenticate with Lingo.dev API")
  .helpOption("-h, --help", "Show help")
  .option("--logout", "Delete existing authentication")
  .option("--login", "Authenticate with Lingo.dev API")
  .action(async (options) => {
    try {
      let settings = await getSettings(undefined);

      if (options.logout) {
        settings.auth.apiKey = "";
        await saveSettings(settings);
      }
      if (options.login) {
        const apiKey = await login(settings.auth.webUrl);
        settings.auth.apiKey = apiKey;
        await saveSettings(settings);
        settings = await getSettings(undefined);
      }

      const authenticator = createAuthenticator({
        apiUrl: settings.auth.apiUrl,
        apiKey: settings.auth.apiKey!,
      });
      const auth = await authenticator.whoami();
      if (!auth) {
        Ora().warn("Not authenticated");
      } else {
        Ora().succeed(`Authenticated as ${auth.email}`);
      }
    } catch (error: any) {
      Ora().fail(error.message);
      process.exit(1);
    }
  });

export async function login(webAppUrl: string) {
  await readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    .question(
      `
Press Enter to open the browser for authentication.

---

Having issues? Put REPLEXICA_API_KEY in your .env file instead.
    `.trim() + "\n",
    );

  const spinner = Ora().start("Waiting for the API key");
  const apiKey = await waitForApiKey(async (port) => {
    await open(`${webAppUrl}/app/cli?port=${port}`, { wait: false });
  });
  spinner.succeed("API key received");

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
