import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
    // In a client-side context (like custom provider), we might use context or cookie
    // For server-side next-intl with App Router, it usually expects a locale from params
    // But we can also determine it from headers/cookies if we don't use [locale] prefixes.

    // For now, let's assume 'fr' as default if we can't determine it.
    const locale = 'fr';

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
