import { getDb } from '$lib/server/db.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '$lib/constants.js';

export { EXPENSE_CATEGORIES, INCOME_CATEGORIES };

// Crear transacción
export async function createTransaction(userId, type, amount, category, description, date) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const transaction = {
			userId,
			type, // 'income' o 'expense'
			amount: parseFloat(amount),
			category,
			description,
			date: date ? new Date(date) : new Date(),
			createdAt: new Date()
		};

		const { insertedId } = await transactions.insertOne(transaction);
		const result = await transactions.findOne({ _id: insertedId });
		return { success: true, transaction: result };
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to create transaction' };
	}
}

// Obtener transacciones de un usuario
export async function getUserTransactions(userId, filters = {}) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const query = { userId };

		if (filters.type) {
			query.type = filters.type;
		}

		if (filters.startDate || filters.endDate) {
			query.date = {};
			if (filters.startDate) {
				query.date.$gte = new Date(filters.startDate);
			}
			if (filters.endDate) {
				query.date.$lte = new Date(filters.endDate);
			}
		}

		const result = await transactions
			.find(query)
			.sort({ date: -1 })
			.toArray();

		return { success: true, transactions: result };
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to get transactions' };
	}
}

// Obtener una transacción por ID
export async function getTransactionById(transactionId, userId) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const transaction = await transactions.findOne({
			_id: transactionId,
			userId
		});

		return { success: true, transaction };
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to get transaction' };
	}
}

// Actualizar transacción
export async function updateTransaction(transactionId, userId, updates) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const updateDoc = {
			$set: {
				...updates,
				updatedAt: new Date()
			}
		};

		if (updates.amount) {
			updateDoc.$set.amount = parseFloat(updates.amount);
		}

		if (updates.date) {
			updateDoc.$set.date = new Date(updates.date);
		}

		const result = await transactions.updateOne(
			{ _id: transactionId, userId },
			updateDoc
		);

		if (result.matchedCount === 0) {
			return { success: false, error: 'Transaction not found' };
		}

		const updated = await transactions.findOne({ _id: transactionId });
		return { success: true, transaction: updated };
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to update transaction' };
	}
}

// Eliminar transacción
export async function deleteTransaction(transactionId, userId) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const result = await transactions.deleteOne({
			_id: transactionId,
			userId
		});

		if (result.deletedCount === 0) {
			return { success: false, error: 'Transaction not found' };
		}

		return { success: true };
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to delete transaction' };
	}
}

// Obtener resumen financiero
export async function getFinancialSummary(userId, startDate, endDate) {
	try {
		const db = await getDb();
		const transactions = db.collection('transactions');

		const query = { userId };
		if (startDate || endDate) {
			query.date = {};
			if (startDate) {
				query.date.$gte = new Date(startDate);
			}
			if (endDate) {
				query.date.$lte = new Date(endDate);
			}
		}

		const allTransactions = await transactions.find(query).toArray();

		const income = allTransactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const expenses = allTransactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		const balance = income - expenses;

		// Agrupar gastos por categoría
		const expensesByCategory = {};
		allTransactions
			.filter((t) => t.type === 'expense')
			.forEach((t) => {
				if (!expensesByCategory[t.category]) {
					expensesByCategory[t.category] = 0;
				}
				expensesByCategory[t.category] += t.amount;
			});

		// Calcular porcentajes
		const expenseCategories = Object.keys(expensesByCategory).map((cat) => ({
			category: cat,
			amount: expensesByCategory[cat],
			percentage: expenses > 0 ? (expensesByCategory[cat] / expenses) * 100 : 0
		}));

		return {
			success: true,
			summary: {
				income,
				expenses,
				balance,
				expenseCategories
			}
		};
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to get summary' };
	}
}
