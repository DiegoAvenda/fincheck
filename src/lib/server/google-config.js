import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
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

export const google = new GoogleOAuth(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	// Se actualiza dinámicamente en el handler
	'http://localhost:5173/api/oauth/google/callback'
);
