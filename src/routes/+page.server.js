import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		redirect(302, '/login');
	}

	return {
		user: {
			id: locals.user._id.toString(),
			name: locals.user.name,
			picture: locals.user.picture,
			googleId: locals.user.googleId
		}
	};
}
