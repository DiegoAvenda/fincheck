import { Google } from 'arctic';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { dev } from '$app/environment';

export const google = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	dev
		? 'http://localhost:5173/api/oauth/google/callback'
		: 'https://pending.vercel.app/api/oauth/google/callback'
);
