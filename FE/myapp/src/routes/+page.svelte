<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, cart } from '$lib/stores.js';
	import ItemSelector from '$lib/components/ItemSelector.svelte';
	import ShoppingCart from '$lib/components/ShoppingCart.svelte';

	onMount(() => {
		// Inizializza il carrello dal localStorage
		cart.init();
		
		// Reindirizza al login se non autenticato (solo lato client)
		if (browser && !$auth.isAuthenticated) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Lista della Spesa Ottimizzata</title>
	<meta name="description" content="Crea e ottimizza la tua lista della spesa" />
</svelte:head>

{#if $auth.isAuthenticated}
	<div class="home-page">
		<div class="hero">
			<h1>Lista della Spesa Ottimizzata</h1>
			<p>Seleziona i tuoi articoli e ottimizza il percorso nel supermercato</p>
		</div>

		<div class="content">
			<ItemSelector />
			<ShoppingCart />
		</div>
	</div>
{:else}
	<div class="loading">
		<p>Caricamento...</p>
	</div>
{/if}

<style>
	.home-page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.hero {
		text-align: center;
		margin-bottom: 40px;
		padding: 40px 20px;
		background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
		color: white;
		border-radius: 12px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
	}

	.hero h1 {
		margin: 0 0 15px 0;
		font-size: 2.5em;
		font-weight: bold;
	}

	.hero p {
		margin: 0;
		font-size: 1.2em;
		opacity: 0.9;
	}

	.content {
		position: relative;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
		color: #666;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2em;
		}

		.hero p {
			font-size: 1em;
		}

		.hero {
			padding: 30px 15px;
		}
	}
</style>
