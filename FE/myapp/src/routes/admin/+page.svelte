<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { auth, isAdmin } from '$lib/stores.js';
	import AdminDashboard from '$lib/components/AdminDashboard.svelte';

	onMount(() => {
		// Verifica permessi admin (solo lato client)
		if (browser && !$isAdmin) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Admin - Lista della Spesa</title>
</svelte:head>

{#if $isAdmin}
	<AdminDashboard />
{:else}
	<div class="loading">
		<p>Verifica permessi...</p>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
		color: #666;
	}
</style>
