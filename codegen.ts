/* eslint-disable import/no-extraneous-dependencies */
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:8080/graphql",
  documents: ["src/**/*.{ts,tsx}", "src/**/**/*.{ts,tsx}"],
  generates: {
    "./src/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
  },
  hooks: { afterAllFileWrite: ["prettier --write"] },
};

export default config;
