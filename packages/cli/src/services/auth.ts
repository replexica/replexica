export type LoadAuthParams = {
  apiUrl: string;
  apiKey: string;
};

export async function loadAuth(params: LoadAuthParams) {
  const whoami = await fetchWhoami(params.apiUrl, params.apiKey);
  if (!whoami) {
    throw new Error(`Not authenticated. Please login using 'replexica auth --login'.`);
  }

  return {
    email: whoami.email,
  };
}

async function fetchWhoami(apiUrl: string, apiKey: string | null) {
  try {
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
  } catch (error) {
    const isNetworkError = error instanceof TypeError && error.message === "fetch failed";
    if (isNetworkError) {
      throw new Error(`Failed to connect to the API at ${apiUrl}. Please check your connection and try again.`);
    } else {
      throw error;
    }
  }
}
