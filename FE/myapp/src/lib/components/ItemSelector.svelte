<script>
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores.js';
	import { getItems } from '$lib/api.js';

	/**
	 * @typedef {Object} Item
	 * @property {string} id
	 * @property {string} name
	 * @property {string} category
	 * @property {number} price
	 * @property {string} section
	 */

	/** @type {Item[]} */
	let items = $state([]);
	/** @type {Object<string, number>} */
	let selectedItems = $state({});
	let loading = $state(false);
	let error = $state('');
	let successMessage = $state('');

	onMount(async () => {
		await loadItems();
	});

	async function loadItems() {
		loading = true;
		error = '';
		try {
			items = await getItems();
		} catch (err) {
			error = 'Errore nel caricamento degli articoli';
			console.error('Error loading items:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {string} itemId
	 * @param {number} quantity
	 */
	function updateSelection(itemId, quantity) {
		if (quantity <= 0) {
			delete selectedItems[itemId];
		} else {
			selectedItems[itemId] = quantity;
		}
		selectedItems = { ...selectedItems };
	}

	function addSelectedToCart() {
		if (Object.keys(selectedItems).length === 0) {
			error = 'Seleziona almeno un articolo';
			return;
		}

		let addedCount = 0;
		for (const [itemId, quantity] of Object.entries(selectedItems)) {
			const item = items.find(i => i.id === itemId);
			if (item) {
				cart.addItem({
					id: item.id,
					name: item.name,
					category: item.category,
					price: item.price,
					quantity: quantity
				});
				addedCount++;
			}
		}

		selectedItems = {};
		successMessage = `${addedCount} articoli aggiunti al carrello!`;
		setTimeout(() => successMessage = '', 3000);
	}

	// Raggruppa articoli per categoria
	const groupedItems = $derived(items.reduce((groups, item) => {
		if (!groups[item.category]) {
			groups[item.category] = [];
		}
		groups[item.category].push(item);
		return groups;
	}, /** @type {Object<string, Item[]>} */ ({})));
</script>

<div class="item-selector">
	<div class="header">
		<h2>Seleziona Articoli</h2>
		{#if Object.keys(selectedItems).length > 0}
			<button class="add-to-cart-btn" onclick={addSelectedToCart}>
				Aggiungi al Carrello ({Object.keys(selectedItems).length})
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="loading">Caricamento articoli...</div>
	{/if}

	{#if error}
		<div class="error">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success">{successMessage}</div>
	{/if}

	{#if !loading && items.length > 0}
		<div class="categories">
			{#each Object.entries(groupedItems) as [category, categoryItems]}
				<div class="category">
					<h3>{category}</h3>
					<div class="items-grid">
						{#each categoryItems as item}
							<div class="item-card">
								<div class="item-info">
									<h4>{item.name}</h4>
									<p class="price">€{item.price.toFixed(2)}</p>
									<p class="section">Sezione: {item.section}</p>
								</div>
								<div class="quantity-controls">
									<button 
										onclick={() => updateSelection(item.id, (selectedItems[item.id] || 0) - 1)}
										disabled={!selectedItems[item.id]}
									>
										-
									</button>
									<span class="quantity">{selectedItems[item.id] || 0}</span>
									<button onclick={() => updateSelection(item.id, (selectedItems[item.id] || 0) + 1)}>
										+
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.item-selector {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.add-to-cart-btn {
		background: #4CAF50;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 6px;
		cursor: pointer;
		font-weight: bold;
		transition: background-color 0.2s;
	}

	.add-to-cart-btn:hover {
		background: #45a049;
	}

	.loading, .error, .success {
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		text-align: center;
	}

	.loading {
		background: #f0f0f0;
		color: #666;
	}

	.error {
		background: #ffebee;
		color: #c62828;
		border: 1px solid #ffcdd2;
	}

	.success {
		background: #e8f5e8;
		color: #2e7d32;
		border: 1px solid #c8e6c9;
	}

	.category {
		margin-bottom: 30px;
	}

	.category h3 {
		color: #333;
		border-bottom: 2px solid #4CAF50;
		padding-bottom: 8px;
		margin-bottom: 15px;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 15px;
	}

	.item-card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 15px;
		background: white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.item-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0,0,0,0.15);
	}

	.item-info h4 {
		margin: 0 0 8px 0;
		color: #333;
	}

	.price {
		font-weight: bold;
		color: #4CAF50;
		font-size: 1.1em;
		margin: 4px 0;
	}

	.section {
		color: #666;
		font-size: 0.9em;
		margin: 4px 0;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		margin-top: 12px;
	}

	.quantity-controls button {
		width: 32px;
		height: 32px;
		border: 1px solid #ddd;
		background: white;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.quantity-controls button:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.quantity-controls button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.quantity {
		min-width: 30px;
		text-align: center;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			gap: 15px;
		}

		.items-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
