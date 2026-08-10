import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/neon-auth`
      : process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/neon-auth`
      : "http://localhost:3000/api/neon-auth",
  fetchOptions: {
    credentials: "include",
  },
});
