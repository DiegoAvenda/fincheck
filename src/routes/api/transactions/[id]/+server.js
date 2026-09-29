import { getTransactionById, updateTransaction, deleteTransaction } from '$lib/server/transactions';
import { ObjectId } from 'mongodb';
import { json } from '@sveltejs/kit';

export async function GET({ params, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const transactionId = new ObjectId(params.id);
		const result = await getTransactionById(transactionId, locals.user._id);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		if (!result.transaction) {
			return json({ error: 'Transaction not found' }, { status: 404 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to get transaction' }, { status: 500 });
	}
}

export async function PUT({ params, request, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const transactionId = new ObjectId(params.id);
		const updates = await request.json();

		const result = await updateTransaction(transactionId, locals.user._id, updates);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to update transaction' }, { status: 500 });
	}
}

export async function DELETE({ params, locals }) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const transactionId = new ObjectId(params.id);
		const result = await deleteTransaction(transactionId, locals.user._id);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json(result);
	} catch (error) {
		console.log(error);
		return json({ error: 'Failed to delete transaction' }, { status: 500 });
	}
}
