// Funciones from scratch para reemplazar arctic (Google OAuth)

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export class GoogleOAuth {
	constructor(clientId, clientSecret, redirectUri) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.redirectUri = redirectUri;
	}

	// Crear URL de autorización
	createAuthorizationURL(state, codeVerifier, scopes = []) {
		const params = new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: this.redirectUri,
			response_type: 'code',
			scope: scopes.join(' '),
			state: state,
			code_challenge: codeVerifier,
			code_challenge_method: 'plain'
		});

		return new URL(`${GOOGLE_AUTH_URL}?${params.toString()}`);
	}

	// Validar código de autorización e intercambiar por tokens
	async validateAuthorizationCode(code, codeVerifier) {
		const params = new URLSearchParams({
			client_id: this.clientId,
			client_secret: this.clientSecret,
			code: code,
			grant_type: 'authorization_code',
			redirect_uri: this.redirectUri,
			code_verifier: codeVerifier
		});

		const response = await fetch(GOOGLE_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params.toString()
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Failed to validate authorization code: ${error}`);
		}

		const data = await response.json();

		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			idToken: data.id_token,
			expiresIn: data.expires_in,
			tokenType: data.token_type
		};
	}
}

// Decodificar ID token de Google
export function decodeIdToken(idToken) {
	const parts = idToken.split('.');
	if (parts.length !== 3) {
		throw new Error('Invalid ID token format');
	}

	const payload = JSON.parse(atob(parts[1]));

	return {
		sub: payload.sub, // Google user ID
		email: payload.email,
		name: payload.name,
		picture: payload.picture,
		emailVerified: payload.email_verified,
		iss: payload.iss,
		aud: payload.aud,
		exp: payload.exp,
		iat: payload.iat
	};
}
