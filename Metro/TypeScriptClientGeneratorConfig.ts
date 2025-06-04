export default {
    plugins: [
        '@hey-api/typescript',
        {
            name: '@hey-api/client-fetch',
            runtimeConfigPath: './config/TypeScriptRuntimeConfig.ts',
        },
        {
            asClass: true,
            name: '@hey-api/sdk',
        },
    ],
};