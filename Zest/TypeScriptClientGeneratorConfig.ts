export default {
    plugins: [
        '@hey-api/typescript',
        'zod',
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