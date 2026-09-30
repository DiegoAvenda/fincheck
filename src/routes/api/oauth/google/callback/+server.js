import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { GoogleOAuth } from '$lib/server/google-oauth';
import { decodeIdToken } from '$lib/server/google-oauth';
import { getUserFromGoogleId, createUser } from '$lib/server/user.js';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { dev } from '$app/environment';

export async function GET(event) {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return new Response(null, {
			status: 400
		});
	}

	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	// Obtener redirect URI dinámicamente
	const redirectUri = dev
		? 'http://localhost:5173/api/oauth/google/callback'
		: `${event.url.origin}/api/oauth/google/callback`;

	const google = new GoogleOAuth(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

	let tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		console.log(e);
		return new Response(null, {
			status: 400
		});
	}

	const claims = decodeIdToken(tokens.idToken);
	const googleUserId = claims.sub;
	const name = claims.name;
	const picture = claims.picture;

	const existingUser = await getUserFromGoogleId(googleUserId);

	if (existingUser !== null) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser._id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (existingUser.admin) {
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/calendar'
				}
			});
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const user = await createUser(googleUserId, name, picture);

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user._id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}
