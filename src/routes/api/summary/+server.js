import { getFinancialSummary } from '$lib/server/transactions';
import { json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		const result = await getFinancialSummary(locals.user._id, startDate, endDate);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to get summary' }, { status: 500 });
	}
}
