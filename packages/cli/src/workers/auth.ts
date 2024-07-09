export type AuthenticatorParams = {
  apiUrl: string;
  apiKey: string;
};

export type AuthPayload = {
  email: string;
  isInWaitlist: boolean;
};

export function createAuthenticator(params: AuthenticatorParams) {
  return {
    async whoami(): Promise<AuthPayload | null> {
      try {
        const res = await fetch(`${params.apiUrl}/whoami`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
            ContentType: "application/json",
          },
        });
      
        if (res.ok) {
          const payload = await res.json();
          if (!payload?.email) { return null; }

          return {
            email: payload.email,
            isInWaitlist: !!payload.isInWaitlist,
          };
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