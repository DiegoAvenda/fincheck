import { generateRecommendations } from '$lib/server/recommendations';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await generateRecommendations(locals.user._id);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to get recommendations' }, { status: 500 });
	}
}
