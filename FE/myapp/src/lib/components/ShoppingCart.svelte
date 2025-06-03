<script>
	import { cart, cartTotal } from '$lib/stores.js';
	import { optimizeRoute } from '$lib/api.js';

	/**
	 * @typedef {Object} CartItem
	 * @property {string} id
	 * @property {string} name
	 * @property {string} category
	 * @property {number} price
	 * @property {number} quantity
	 */

	/** @type {boolean} */
	let showModal = $state(false);
	/** @type {CartItem[]} */
	let optimizedList = $state([]);
	let loading = $state(false);
	let error = $state('');
	/** @type {HTMLDivElement|null} */
	let modalRef = $state(null);

	function openModal() {
		showModal = true;
		// Focus sul modal quando si apre
		setTimeout(() => {
			if (modalRef) {
				modalRef.focus();
			}
		}, 100);
	}

	function closeModal() {
		showModal = false;
		optimizedList = [];
		error = '';
	}

	async function optimizeShoppingList() {
		if ($cart.length === 0) {
			error = 'Il carrello è vuoto';
			return;
		}

		loading = true;
		error = '';
		try {
			const itemIds = $cart.map(item => item.id);
			const optimized = await optimizeRoute(itemIds);
			
			// Mappa gli Item[] a CartItem[] aggiungendo la quantità dal carrello
			optimizedList = optimized.map(item => {
				const cartItem = $cart.find(ci => ci.id === item.id);
				return {
					...item,
					quantity: cartItem ? cartItem.quantity : 1
				};
			});
		} catch (err) {
			error = 'Errore nell\'ottimizzazione del percorso';
			console.error('Error optimizing route:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {string} itemId
	 * @param {number} newQuantity
	 */
	function updateQuantity(itemId, newQuantity) {
		cart.updateQuantity(itemId, newQuantity);
	}

	/**
	 * @param {string} itemId
	 */
	function removeItem(itemId) {
		cart.removeItem(itemId);
	}

	function clearCart() {
		if (confirm('Sei sicuro di voler svuotare il carrello?')) {
			cart.clear();
			closeModal();
		}
	}

	async function printList() {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		const listToPrint = optimizedList.length > 0 ? optimizedList : $cart;
		
		printWindow.document.write(`
			<html>
				<head>
					<title>Lista della Spesa</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; }
						h1 { color: #333; border-bottom: 2px solid #4CAF50; }
						.item { margin: 10px 0; padding: 8px; border-left: 3px solid #4CAF50; }
						.total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
						@media print { body { margin: 0; } }
					</style>
				</head>
				<body>
					<h1>Lista della Spesa Ottimizzata</h1>
					${listToPrint.map(item => `
						<div class="item">
							<strong>${item.name}</strong> - Quantità: ${item.quantity} - €${(item.price * item.quantity).toFixed(2)}
							<br><small>Categoria: ${item.category}</small>
						</div>
					`).join('')}
					<div class="total">Totale: €${$cartTotal.toFixed(2)}</div>
				</body>
			</html>
		`);
		
		printWindow.document.close();
		printWindow.print();
	}

	/**
	 * Gestisce i tasti premuti sul modal
	 * @param {KeyboardEvent} e
	 */
	function handleModalKeydown(e) {
		if (e.key === 'Escape') {
			closeModal();
		}
	}

	/**
	 * Gestisce il click sull'overlay
	 * @param {MouseEvent} e
	 */
	function handleOverlayClick(e) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}

	// Raggruppa per categoria
	const groupedCart = $derived($cart.reduce((groups, item) => {
		if (!groups[item.category]) {
			groups[item.category] = [];
		}
		groups[item.category].push(item);
		return groups;
	}, /** @type {Object<string, CartItem[]>} */ ({})));
</script>

<button class="cart-button" onclick={openModal} disabled={$cart.length === 0}>
	🛒 Carrello ({$cart.length})
	{#if $cartTotal > 0}
		<span class="total">€{$cartTotal.toFixed(2)}</span>
	{/if}
</button>

{#if showModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div 
		class="modal-overlay" 
		role="dialog" 
		aria-modal="true" 
		tabindex="-1"
		onclick={handleOverlayClick}
		onkeydown={handleModalKeydown}
		bind:this={modalRef}
	>
		<div class="modal" role="document">
			<div class="modal-header">
				<h2>Carrello della Spesa</h2>
				<button class="close-btn" onclick={closeModal} aria-label="Chiudi modal">×</button>
			</div>

			<div class="modal-content">
				{#if $cart.length === 0}
					<p class="empty-cart">Il carrello è vuoto</p>
				{:else}
					<div class="cart-actions">
						<button onclick={optimizeShoppingList} disabled={loading}>
							{loading ? 'Ottimizzazione...' : 'Ottimizza Percorso'}
						</button>
						<button onclick={printList}>Stampa Lista</button>
						<button onclick={clearCart} class="danger">Svuota Carrello</button>
					</div>

					{#if error}
						<div class="error">{error}</div>
					{/if}

					{#if optimizedList.length > 0}
						<div class="optimized-section">
							<h3>Lista Ottimizzata</h3>
							<div class="optimized-list">
								{#each optimizedList as item, index}
									<div class="optimized-item">
										<span class="step">{index + 1}</span>
										<div class="item-details">
											<strong>{item.name}</strong>
											<span>Quantità: {item.quantity}</span>
											<span>€{(item.price * item.quantity).toFixed(2)}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<div class="cart-items">
						<h3>Articoli nel Carrello</h3>
						{#each Object.entries(groupedCart) as [category, items]}
							<div class="category-section">
								<h4>{category}</h4>
								{#each items as item}
									<div class="cart-item">
										<div class="item-info">
											<strong>{item.name}</strong>
											<span class="price">€{item.price.toFixed(2)} cad.</span>
										</div>
										<div class="quantity-controls">
											<button onclick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Diminuisci quantità">-</button>
											<span>{item.quantity}</span>
											<button onclick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Aumenta quantità">+</button>
										</div>
										<div class="item-total">
											€{(item.price * item.quantity).toFixed(2)}
										</div>
										<button class="remove-btn" onclick={() => removeItem(item.id)} aria-label="Rimuovi articolo">🗑️</button>
									</div>
								{/each}
							</div>
						{/each}
					</div>

					<div class="cart-total">
						<strong>Totale: €{$cartTotal.toFixed(2)}</strong>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.cart-button {
		position: fixed;
		top: 20px;
		right: 20px;
		background: #4CAF50;
		color: white;
		border: none;
		padding: 12px 20px;
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		box-shadow: 0 4px 8px rgba(0,0,0,0.2);
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.cart-button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.total {
		background: rgba(255,255,255,0.2);
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.9em;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-overlay:focus {
		outline: none;
	}

	.modal {
		background: white;
		border-radius: 12px;
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0,0,0,0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #eee;
		background: #f8f9fa;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #666;
		padding: 4px;
		border-radius: 4px;
	}

	.close-btn:hover {
		background: #e9ecef;
	}

	.close-btn:focus {
		outline: 2px solid #4CAF50;
		outline-offset: 2px;
	}

	.modal-content {
		padding: 20px;
		overflow-y: auto;
		max-height: calc(90vh - 80px);
	}

	.empty-cart {
		text-align: center;
		color: #666;
		font-style: italic;
		padding: 40px;
	}

	.cart-actions {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.cart-actions button {
		padding: 8px 16px;
		border: 1px solid #ddd;
		border-radius: 6px;
		cursor: pointer;
		background: white;
		transition: background-color 0.2s;
	}

	.cart-actions button:hover {
		background: #f5f5f5;
	}

	.cart-actions button:focus {
		outline: 2px solid #4CAF50;
		outline-offset: 2px;
	}

	.cart-actions .danger {
		background: #ffebee;
		border-color: #ffcdd2;
		color: #c62828;
	}

	.error {
		background: #ffebee;
		color: #c62828;
		padding: 12px;
		border-radius: 6px;
		margin: 10px 0;
	}

	.optimized-section {
		background: #e8f5e8;
		padding: 15px;
		border-radius: 8px;
		margin: 20px 0;
	}

	.optimized-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.optimized-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px;
		background: white;
		border-radius: 6px;
	}

	.step {
		background: #4CAF50;
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8em;
		font-weight: bold;
	}

	.item-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.category-section {
		margin: 20px 0;
	}

	.category-section h4 {
		color: #4CAF50;
		border-bottom: 1px solid #4CAF50;
		padding-bottom: 4px;
		margin-bottom: 10px;
	}

	.cart-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px;
		border: 1px solid #eee;
		border-radius: 8px;
		margin: 8px 0;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.price {
		color: #666;
		font-size: 0.9em;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.quantity-controls button {
		width: 28px;
		height: 28px;
		border: 1px solid #ddd;
		background: white;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.quantity-controls button:hover {
		background: #f5f5f5;
	}

	.quantity-controls button:focus {
		outline: 2px solid #4CAF50;
		outline-offset: 2px;
	}

	.item-total {
		font-weight: bold;
		min-width: 80px;
		text-align: right;
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.remove-btn:hover {
		background: #ffebee;
	}

	.remove-btn:focus {
		outline: 2px solid #f44336;
		outline-offset: 2px;
	}

	.cart-total {
		text-align: right;
		font-size: 1.2em;
		padding: 20px 0;
		border-top: 2px solid #4CAF50;
		margin-top: 20px;
	}

	@media (max-width: 768px) {
		.cart-button {
			position: static;
			margin: 10px;
		}

		.modal {
			width: 95%;
			margin: 10px;
		}

		.cart-item {
			flex-direction: column;
			align-items: stretch;
			gap: 10px;
		}

		.cart-actions {
			flex-direction: column;
		}
	}
</style>
