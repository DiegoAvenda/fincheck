<script>
	import { onMount } from 'svelte';
	import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '$lib/constants';

	let summary = $state(null);
	let transactions = $state([]);
	let recommendations = $state([]);
	let showAddModal = $state(false);
	let showFilterModal = $state(false);
	let editingTransaction = $state(null);
	let filterType = $state('all');
	let loading = $state(true);

	// Formulario de transacción
	let formType = $state('expense');
	let formAmount = $state('');
	let formCategory = $state('');
	let formDescription = $state('');
	let formDate = $state(new Date().toISOString().split('T')[0]);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [summaryRes, transactionsRes, recommendationsRes] = await Promise.all([
				fetch('/api/summary'),
				fetch('/api/transactions'),
				fetch('/api/recommendations')
			]);

			summary = (await summaryRes.json()).summary;
			transactions = (await transactionsRes.json()).transactions;
			recommendations = (await recommendationsRes.json()).recommendations;
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			loading = false;
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		try {
			const response = await fetch('/api/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: formType,
					amount: formAmount,
					category: formCategory,
					description: formDescription,
					date: formDate
				})
			});

			if (response.ok) {
				showAddModal = false;
				resetForm();
				await loadData();
			}
		} catch (error) {
			console.error('Error creating transaction:', error);
		}
	}

	async function handleDelete(id) {
		if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;

		try {
			const response = await fetch(`/api/transactions/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadData();
			}
		} catch (error) {
			console.error('Error deleting transaction:', error);
		}
	}

	function resetForm() {
		formType = 'expense';
		formAmount = '';
		formCategory = '';
		formDescription = '';
		formDate = new Date().toISOString().split('T')[0];
		editingTransaction = null;
	}

	function getCategoryIcon(categoryId) {
		const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
		const cat = allCategories.find((c) => c.id === categoryId);
		return cat ? cat.icon : '📦';
	}

	function getCategoryName(categoryId) {
		const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
		const cat = allCategories.find((c) => c.id === categoryId);
		return cat ? cat.name : categoryId;
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: 'MXN'
		}).format(amount);
	}

	let currentCategories = $derived(
		formType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
	);
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-gray-600">Cargando...</div>
	</div>
{:else}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">FinCheck</h1>
			<p class="text-gray-600 mt-2">Control de finanzas personales</p>
		</div>

		<!-- Summary Cards -->
		{#if summary}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm font-medium text-gray-500">Ingresos</div>
					<div class="mt-2 text-3xl font-bold text-green-600">{formatCurrency(summary.income)}</div>
				</div>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm font-medium text-gray-500">Gastos</div>
					<div class="mt-2 text-3xl font-bold text-red-600">{formatCurrency(summary.expenses)}</div>
				</div>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="text-sm font-medium text-gray-500">Balance</div>
					<div class="mt-2 text-3xl font-bold {summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}">
						{formatCurrency(summary.balance)}
					</div>
				</div>
			</div>
		{/if}

		<!-- Recommendations -->
		{#if recommendations.length > 0}
			<div class="mb-8">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Recomendaciones</h2>
				<div class="space-y-4">
					{#each recommendations as rec}
						<div
							class="bg-white rounded-lg shadow p-4 border-l-4 {rec.type === 'positive'
								? 'border-green-500'
								: rec.type === 'warning'
									? 'border-yellow-500'
									: rec.type === 'investment'
										? 'border-blue-500'
										: 'border-purple-500'}"
						>
							<div class="font-medium text-gray-900">{rec.title}</div>
							<div class="text-sm text-gray-600 mt-1">{rec.message}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Expense Categories Breakdown -->
		{#if summary && summary.expenseCategories.length > 0}
			<div class="mb-8">
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Distribución de Gastos</h2>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="space-y-4">
						{#each summary.expenseCategories as cat}
							<div>
								<div class="flex justify-between text-sm mb-1">
									<span class="text-gray-700">
										{getCategoryIcon(cat.category)} {getCategoryName(cat.category)}
									</span>
									<span class="text-gray-900 font-medium">{cat.percentage.toFixed(1)}%</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div
										class="bg-indigo-600 h-2 rounded-full"
										style="width: {cat.percentage}%"
									></div>
								</div>
								<div class="text-xs text-gray-500 mt-1">{formatCurrency(cat.amount)}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Transactions -->
		<div class="mb-8">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold text-gray-900">Transacciones</h2>
				<button
					onclick={() => {
						resetForm();
						showAddModal = true;
					}}
					class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
				>
					Agregar Transacción
				</button>
			</div>

			<div class="bg-white rounded-lg shadow overflow-hidden">
				{#if transactions.length === 0}
					<div class="p-6 text-center text-gray-500">
						No hay transacciones registradas
					</div>
				{:else}
					<div class="divide-y divide-gray-200">
						{#each transactions as transaction}
							<div class="p-4 hover:bg-gray-50">
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-4">
										<div class="text-2xl">{getCategoryIcon(transaction.category)}</div>
										<div>
											<div class="font-medium text-gray-900">
												{getCategoryName(transaction.category)}
											</div>
											<div class="text-sm text-gray-500">
												{transaction.description || 'Sin descripción'}
											</div>
											<div class="text-xs text-gray-400">{formatDate(transaction.date)}</div>
										</div>
									</div>
									<div class="flex items-center space-x-4">
										<div
											class="text-lg font-semibold {transaction.type === 'income'
												? 'text-green-600'
												: 'text-red-600'}"
										>
											{transaction.type === 'income' ? '+' : '-'}
											{formatCurrency(transaction.amount)}
										</div>
										<button
											onclick={() => handleDelete(transaction._id)}
											class="text-red-600 hover:text-red-900"
										>
											Eliminar
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Add Transaction Modal -->
	{#if showAddModal}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
				<div class="p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">
						{editingTransaction ? 'Editar' : 'Agregar'} Transacción
					</h3>

					<form onsubmit={handleSubmit}>
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
								<select
									bind:value={formType}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="expense">Gasto</option>
									<option value="income">Ingreso</option>
								</select>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
								<input
									type="number"
									step="0.01"
									bind:value={formAmount}
									required
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
								<select
									bind:value={formCategory}
									required
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="">Seleccionar...</option>
									{#each currentCategories as cat}
										<option value={cat.id}>{cat.icon} {cat.name}</option>
									{/each}
								</select>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
								<input
									type="text"
									bind:value={formDescription}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
								<input
									type="date"
									bind:value={formDate}
									required
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>
						</div>

						<div class="flex justify-end space-x-3 mt-6">
							<button
								type="button"
								onclick={() => (showAddModal = false)}
								class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
							>
								Cancelar
							</button>
							<button
								type="submit"
								class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
							>
								{editingTransaction ? 'Actualizar' : 'Agregar'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
{/if}
