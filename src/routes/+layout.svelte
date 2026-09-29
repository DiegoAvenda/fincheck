<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	let { children } = $props();

	async function logout() {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (error) {
			console.error('Error logging out:', error);
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>FinCheck - Finanzas Personales</title>
</svelte:head>

{#if $page.data.user}
	<div class="min-h-screen bg-gray-50">
		<nav class="bg-white shadow-sm">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex items-center">
						<a href="/" class="text-xl font-bold text-indigo-600">FinCheck</a>
					</div>
					<div class="flex items-center space-x-4">
						{#if $page.data.user.picture}
							<img
								src={$page.data.user.picture}
								alt={$page.data.user.name}
								class="h-8 w-8 rounded-full"
							/>
						{/if}
						<span class="text-gray-700">{$page.data.user.name}</span>
						<button
							onclick={logout}
							class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
						>
							Cerrar sesión
						</button>
					</div>
				</div>
			</div>
		</nav>
		{@render children()}
	</div>
{:else}
	{@render children()}
{/if}
