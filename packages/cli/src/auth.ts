import { Command } from "commander";

export default new Command()
  .command("auth")
  .description("Authenticate with Replexica")
  .helpOption("-h, --help", "Show help")
  .action(async () => {
    const message = `
To obtain Replexica API key, please follow the following link:

https://replexica.com/app/settings

Once you have your API key, please save it in the .env file in the root of your project.
          `.trim();

    console.log(message);
  });
