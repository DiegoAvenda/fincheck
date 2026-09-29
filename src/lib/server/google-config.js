import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import { GoogleOAuth } from './google-oauth.js';

export const google = new GoogleOAuth(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	dev
		? 'http://localhost:5173/api/oauth/google/callback'
		: 'https://pending.vercel.app/api/oauth/google/callback'
);
