import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:password@db:5432/crypto_oracle",
  },
});
