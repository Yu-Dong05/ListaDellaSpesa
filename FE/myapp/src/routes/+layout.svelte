<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, isAdmin } from '$lib/stores.js';
	
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// Inizializza gli store
		auth.init();
	});

	function handleLogout() {
		if (confirm('Sei sicuro di voler uscire?')) {
			auth.logout();
			goto('/login');
		}
	}

	// Protezione delle route - solo lato client
	$effect(() => {
		if (browser) {
			if ($page.url.pathname === '/admin' && !$isAdmin) {
				goto('/login');
			}
			
			if ($page.url.pathname !== '/login' && !$auth.isAuthenticated) {
				goto('/login');
			}
		}
	});
</script>

<div class="app">
	{#if $auth.isAuthenticated}
		<nav class="navbar">
			<div class="nav-content">
				<div class="nav-left">
					<a href="/" class="logo">🛒 Lista Spesa</a>
					<div class="nav-links">
						<a href="/" class:active={$page.url.pathname === '/'}>
							Home
						</a>
						{#if $isAdmin}
							<a href="/admin" class:active={$page.url.pathname === '/admin'}>
								Admin
							</a>
						{/if}
					</div>
				</div>
				<div class="nav-right">
					<span class="user-info">
						Ciao, {$auth.user?.username}
						{#if $auth.user?.role === 'admin'}
							<span class="admin-badge">Admin</span>
						{/if}
					</span>
					<button onclick={handleLogout} class="logout-btn">
						Esci
					</button>
				</div>
			</div>
		</nav>
	{/if}

	<main class="main-content" class:with-nav={$auth.isAuthenticated}>
		{@render children?.()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f8f9fa;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.navbar {
		background: white;
		border-bottom: 1px solid #e0e0e0;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
	}

	.nav-left {
		display: flex;
		align-items: center;
		gap: 30px;
	}

	.logo {
		font-size: 1.2em;
		font-weight: bold;
		color: #4CAF50;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 20px;
	}

	.nav-links a {
		color: #666;
		text-decoration: none;
		padding: 8px 16px;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		background: #4CAF50;
		color: white;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.user-info {
		color: #666;
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.admin-badge {
		background: #4CAF50;
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: bold;
	}

	.logout-btn {
		background: #f44336;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.logout-btn:hover {
		background: #d32f2f;
	}

	.main-content {
		flex: 1;
		padding: 20px;
	}

	.main-content.with-nav {
		padding-top: 20px;
	}

	@media (max-width: 768px) {
		.nav-content {
			padding: 0 15px;
			flex-direction: column;
			height: auto;
			padding-top: 10px;
			padding-bottom: 10px;
			gap: 10px;
		}

		.nav-left {
			flex-direction: column;
			gap: 15px;
		}

		.nav-links {
			gap: 10px;
		}

		.user-info {
			flex-direction: column;
			text-align: center;
			gap: 4px;
		}
	}
</style>
