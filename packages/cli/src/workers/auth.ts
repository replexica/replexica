export type AuthenticatorParams = {
  apiUrl: string;
  apiKey: string;
};

export function createAuthenticator(params: AuthenticatorParams) {
  return {
    async whoami() {
      try {
        const res = await fetch(`${params.apiUrl}/whoami`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
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
          throw new Error(`Failed to connect to the API at ${params.apiUrl}. Please check your connection and try again.`);
        } else {
          throw error;
        }
      }
    }
  };
}