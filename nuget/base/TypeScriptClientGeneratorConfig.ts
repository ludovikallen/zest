export default {
  plugins: [
    "@hey-api/typescript",
    "@tanstack/react-query",
    "zod",
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./config/TypeScriptRuntimeConfig.ts",
    },
    {
      asClass: true,
      name: "@hey-api/sdk",
    },
  ],
};
