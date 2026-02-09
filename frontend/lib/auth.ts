import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: {
    provider: "sqlite",
    url: "file:./auth.db",
  },
  emailAndPassword: {
    enabled: true,
  },
});
