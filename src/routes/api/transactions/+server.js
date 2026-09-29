import { createTransaction, getUserTransactions } from '$lib/server/transactions';
import { json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const type = url.searchParams.get('type');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		const filters = {};
		if (type) filters.type = type;
		if (startDate) filters.startDate = startDate;
		if (endDate) filters.endDate = endDate;

		const result = await getUserTransactions(locals.user._id, filters);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to get transactions' }, { status: 500 });
	}
}

export async function POST({ request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { type, amount, category, description, date } = await request.json();

		if (!type || !amount || !category) {
			return json({ error: 'Type, amount, and category are required' }, { status: 400 });
		}

		const result = await createTransaction(
			locals.user._id,
			type,
			amount,
			category,
			description,
			date
		);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to create transaction' }, { status: 500 });
	}
}
