import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
    "https://ep-summer-queen-aymmn3zk.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth",
  fetchOptions: {
    credentials: "include",
  },
});
