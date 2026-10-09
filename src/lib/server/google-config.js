import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { GoogleOAuth } from './google-oauth.js';

// La URL de callback se puede configurar por variable de entorno o usar la del request
// En desarrollo usa localhost, en producción usa la URL actual
export function getGoogleOAuthRedirectUri(requestUrl) {
	if (dev) {
		return 'http://localhost:5173/api/oauth/google/callback';
	}
	// En producción, usar la URL del request actual
	const url = new URL(requestUrl);
	return `${url.origin}/api/oauth/google/callback`;
}

// Se construye de forma perezosa para no romper el build/SSR cuando
// las variables de entorno aún no están definidas.
export function getGoogleOAuth(redirectUri) {
	const clientId = env.GOOGLE_CLIENT_ID;
	const clientSecret = env.GOOGLE_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not defined.');
	}

	return new GoogleOAuth(
		clientId,
		clientSecret,
		redirectUri ?? 'http://localhost:5173/api/oauth/google/callback'
	);
}

