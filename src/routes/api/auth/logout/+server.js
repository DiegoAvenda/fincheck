import { validateSessionToken, invalidateSession, deleteSessionTokenCookie } from '$lib/server/session';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	try {
		const token = cookies.get('session');

		if (token) {
			const { session } = await validateSessionToken(token);
			if (session) {
				await invalidateSession(session.id);
			}
		}

		deleteSessionTokenCookie({ cookies });

		return json({ success: true });
	} catch (error) {
		console.log(error);
		return json({ error: 'Logout failed' }, { status: 500 });
	}
}
