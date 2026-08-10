import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? `${window.location.origin}/api/auth`
      : process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth`
      : "http://localhost:3000/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
