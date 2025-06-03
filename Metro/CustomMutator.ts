export const customFetcher = ({ url, options }: { url: string; options?: RequestInit }) => {
    // @ts-ignore
    const baseUrl = import.meta.env.API_BASE_URL ?? '';
    return fetch(`${baseUrl}${url}`, options).then(res => res.json());
};