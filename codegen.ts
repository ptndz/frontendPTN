/* eslint-disable import/no-extraneous-dependencies */
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:8080/graphql",
  documents: [
    "src/**/*.{ts,tsx}",
    "src/**/**/*.{ts,tsx}",
    "src/pages/[username].tsx",
  ],
  generates: {
    "./src/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
    // W6: client-preset v7 emits ONLY operation types — no schema types
    // (User, IUser, IComment, IPost, ...). Generate them separately with
    // the `typescript` plugin so components can keep importing them from
    // src/gql/graphql (re-exported there, see the hook script below).
    "./src/gql/schema-types.ts": {
      plugins: ["typescript"],
    },
  },
  hooks: {
    afterAllFileWrite: [
      "prettier --write",
      // W6: re-append `export * from "./schema-types";` to
      // src/gql/graphql.ts — codegen regenerates that file from scratch,
      // so the re-export would otherwise be lost on every run.
      "node scripts/codegen-append-schema-reexport.cjs",
    ],
  },
};

export default config;
