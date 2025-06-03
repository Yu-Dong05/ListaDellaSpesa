<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores.js';
	import Login from '$lib/components/Login.svelte';

	onMount(() => {
		// Se l'utente è già autenticato, reindirizza
		if ($auth.isAuthenticated) {
			if ($auth.user?.role === 'admin') {
				goto('/admin');
			} else {
				goto('/');
			}
		}
	});
</script>

<svelte:head>
	<title>Accesso - Lista della Spesa</title>
</svelte:head>

<Login />
