import { generateState, generateCodeVerifier } from '$lib/server/crypto';
import { GoogleOAuth } from '$lib/server/google-oauth';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export async function GET(event) {
	const clientId = env.GOOGLE_CLIENT_ID;
	const clientSecret = env.GOOGLE_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		return new Response('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.', {
			status: 500
		});
	}

	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	// Obtener redirect URI dinámicamente
	const redirectUri = dev
		? 'http://localhost:5173/api/oauth/google/callback'
		: `${event.url.origin}/api/oauth/google/callback`;

	const google = new GoogleOAuth(clientId, clientSecret, redirectUri);
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile']);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});
	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
