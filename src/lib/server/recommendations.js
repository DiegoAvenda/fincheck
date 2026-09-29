import { getFinancialSummary, getUserTransactions } from './transactions.js';

// Generar recomendaciones basadas en el análisis financiero
export async function generateRecommendations(userId) {
	try {
		// Obtener datos del último mes
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		const summaryResult = await getFinancialSummary(userId, firstDayOfMonth, lastDayOfMonth);
		const transactionsResult = await getUserTransactions(userId, {
			startDate: firstDayOfMonth,
			endDate: lastDayOfMonth
		});

		if (!summaryResult.success || !transactionsResult.success) {
			return { success: false, error: 'Failed to generate recommendations' };
		}

		const { summary } = summaryResult;
		const { transactions } = transactionsResult;

		const recommendations = [];
		const alerts = [];

		// Análisis de balance
		if (summary.balance < 0) {
			alerts.push({
				type: 'danger',
				title: 'Déficit financiero',
				message: 'Estás gastando más de lo que ingresas. Revisa tus gastos urgentemente.',
				priority: 'high'
			});
		} else if (summary.balance < summary.income * 0.1) {
			alerts.push({
				type: 'warning',
				title: 'Ahorro bajo',
				message: 'Tu ahorro es menor al 10% de tus ingresos. Intenta reducir gastos.',
				priority: 'medium'
			});
		}

		// Análisis de gastos por categoría
		const highSpendingCategories = summary.expenseCategories.filter(
			(cat) => cat.percentage > 30
		);

		if (highSpendingCategories.length > 0) {
			highSpendingCategories.forEach((cat) => {
				recommendations.push({
					type: 'spending',
					title: `Gasto alto en ${cat.category}`,
					message: `Estás gastando el ${cat.percentage.toFixed(1)}% en ${cat.category}. Considera reducir este gasto.`,
					category: cat.category,
					percentage: cat.percentage
				});
			});
		}

		// Recomendación de ahorro
		const savingsRate = summary.income > 0 ? (summary.balance / summary.income) * 100 : 0;

		if (savingsRate >= 20) {
			recommendations.push({
				type: 'positive',
				title: 'Excelente ahorro',
				message: `Estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos. ¡Mantén el buen trabajo!`,
				savingsRate
			});
		} else if (savingsRate >= 10) {
			recommendations.push({
				type: 'suggestion',
				title: 'Potencial de ahorro',
				message: `Tu ahorro del ${savingsRate.toFixed(1)}% es bueno, pero podrías intentar llegar al 20%.`,
				savingsRate
			});
		} else {
			recommendations.push({
				type: 'warning',
				title: 'Mejorar ahorro',
				message: `Tu ahorro actual es del ${savingsRate.toFixed(1)}%. Intenta aumentar tus ingresos o reducir gastos.`,
				savingsRate
			});
		}

		// Recomendaciones de inversión
		if (summary.balance > 0 && savingsRate >= 10) {
			recommendations.push({
				type: 'investment',
				title: 'Considera invertir',
				message: 'Con tu capacidad de ahorro actual, podrías considerar opciones de inversión para hacer crecer tu dinero.',
				amount: summary.balance
			});
		}

		// Alerta de gastos frecuentes
		const recentExpenses = transactions.filter((t) => t.type === 'expense');
		const expenseFrequency = {};

		recentExpenses.forEach((t) => {
			const key = `${t.category}-${t.description || 'sin descripción'}`;
			if (!expenseFrequency[key]) {
				expenseFrequency[key] = { count: 0, amount: 0, category: t.category };
			}
			expenseFrequency[key].count++;
			expenseFrequency[key].amount += t.amount;
		});

		Object.values(expenseFrequency).forEach((item) => {
			if (item.count > 5) {
				recommendations.push({
					type: 'pattern',
					title: 'Gasto recurrente detectado',
					message: `Has realizado ${item.count} gastos similares en ${item.category} por un total de $${item.amount.toFixed(2)}.`,
					category: item.category,
					count: item.count,
					amount: item.amount
				});
			}
		});

		// Alerta de falta de ingresos
		const incomeTransactions = transactions.filter((t) => t.type === 'income');
		if (incomeTransactions.length === 0) {
			alerts.push({
				type: 'warning',
				title: 'Sin ingresos este mes',
				message: 'No has registrado ingresos este mes. Asegúrate de registrar todos tus ingresos.',
				priority: 'medium'
			});
		}

		return {
			success: true,
			recommendations,
			alerts,
			summary
		};
	} catch (error) {
		console.log(error);
		return { success: false, error: 'Failed to generate recommendations' };
	}
}

// Generar metas de ahorro sugeridas
export function generateSavingsGoals(summary) {
	const goals = [];

	if (summary.balance > 0) {
		// Fondo de emergencia (3-6 meses de gastos)
		const monthlyExpenses = summary.expenses;
		const emergencyFund = monthlyExpenses * 3;

		goals.push({
			name: 'Fondo de emergencia',
			target: emergencyFund,
			current: summary.balance,
			description: 'Cubre 3 meses de gastos básicos',
			percentage: Math.min((summary.balance / emergencyFund) * 100, 100)
		});

		// Meta de inversión
		if (summary.balance > emergencyFund) {
			const investmentGoal = summary.balance * 2;
			goals.push({
				name: 'Meta de inversión',
				target: investmentGoal,
				current: summary.balance,
				description: 'Duplicar tu capital actual',
				percentage: (summary.balance / investmentGoal) * 100
			});
		}
	}

	return goals;
}
