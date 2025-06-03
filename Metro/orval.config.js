module.exports = {
    backend: {
        input: {
        },
        output: {
            mode: 'single',
            client: 'fetch',
            baseUrl: '${import.meta.env.VITE_API_BASE_URL}',
            mock: false,
        },
    },
};