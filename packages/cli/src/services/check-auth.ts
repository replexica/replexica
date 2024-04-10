import Ora from "ora";

import { getEnv } from "./env.js";
import { loadSettings } from "./settings.js";

export async function checkAuth() {
  const env = getEnv();
  const settings = await loadSettings();

  const finalApiKey = env.REPLEXICA_API_KEY || settings.auth.apiKey;
  const isApiKeyFromEnv = !!env.REPLEXICA_API_KEY;

  const spinner = Ora().start('Checking login status');

  const whoami = await fetchWhoami(env.REPLEXICA_API_URL, finalApiKey);
  if (!whoami) {
    spinner.warn('Not logged in. Please run `replexica auth --login` to authenticate.');
    return false;
  }
  
  let msg = `Logged in as ${whoami.email}`;
  if (isApiKeyFromEnv) {
    msg += ' (via REPLEXICA_API_KEY from environment)';
  }
  spinner.succeed(msg);

  return true;
}

async function fetchWhoami(apiUrl: string, apiKey: string | null) {
  const res = await fetch(`${apiUrl}/whoami`, {
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