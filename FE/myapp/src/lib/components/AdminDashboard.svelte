<script>
	import { onMount } from 'svelte';
	import { getItems, addItem, updateItem, deleteItem } from '$lib/api.js';

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
	/** @type {Item|null} */
	let editingItem = $state(null);
	let showAddForm = $state(false);
	let loading = $state(false);
	let error = $state('');
	let successMessage = $state('');

	/** @type {Item} */
	let newItem = $state({
		id: '',
		name: '',
		category: '',
		aisle: 1,
		price: 0,
		section: ''
	});

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

	async function handleAddItem() {
		if (!newItem.name || !newItem.category || !newItem.section) {
			error = 'Compila tutti i campi obbligatori';
			return;
		}

		try {
			await addItem(newItem);
			await loadItems();
			resetForm();
			successMessage = 'Articolo aggiunto con successo!';
			setTimeout(() => successMessage = '', 3000);
		} catch (err) {
			error = 'Errore nell\'aggiunta dell\'articolo';
			console.error('Error adding item:', err);
		}
	}

	/**
	 * @param {Item} item
	 */
	async function handleUpdateItem(item) {
		try {
			await updateItem(item.id, item);
			await loadItems();
			editingItem = null;
			successMessage = 'Articolo aggiornato con successo!';
			setTimeout(() => successMessage = '', 3000);
		} catch (err) {
			error = 'Errore nell\'aggiornamento dell\'articolo';
			console.error('Error updating item:', err);
		}
	}

	/**
	 * @param {string} itemId
	 */
	async function handleDeleteItem(itemId) {
		if (!confirm('Sei sicuro di voler eliminare questo articolo?')) {
			return;
		}

		try {
			await deleteItem(itemId);
			await loadItems();
			successMessage = 'Articolo eliminato con successo!';
			setTimeout(() => successMessage = '', 3000);
		} catch (err) {
			error = 'Errore nell\'eliminazione dell\'articolo';
			console.error('Error deleting item:', err);
		}
	}

	function resetForm() {
		newItem = {
			id: '',
			name: '',
			category: '',
			price: 0,
			section: ''
		};
		showAddForm = false;
		editingItem = null;
		error = '';
	}

	/**
	 * @param {Item} item
	 */
	function startEdit(item) {
		editingItem = { ...item };
		showAddForm = false;
	}

	function cancelEdit() {
		editingItem = null;
	}

	// Statistiche
	const totalItems = $derived(items.length);
	const categories = $derived([...new Set(items.map(item => item.category))]);
	const sections = $derived([...new Set(items.map(item => item.section))]);
	const averagePrice = $derived(items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0);
</script>

<div class="admin-dashboard">
	<div class="header">
		<h1>Pannello Amministratore</h1>
		<button class="add-btn" onclick={() => showAddForm = !showAddForm}>
			{showAddForm ? 'Annulla' : 'Aggiungi Articolo'}
		</button>
	</div>

	<!-- Statistiche -->
	<div class="stats">
		<div class="stat-card">
			<h3>Totale Articoli</h3>
			<p class="stat-number">{totalItems}</p>
		</div>
		<div class="stat-card">
			<h3>Categorie</h3>
			<p class="stat-number">{categories.length}</p>
		</div>
		<div class="stat-card">
			<h3>Sezioni</h3>
			<p class="stat-number">{sections.length}</p>
		</div>
		<div class="stat-card">
			<h3>Prezzo Medio</h3>
			<p class="stat-number">€{averagePrice.toFixed(2)}</p>
		</div>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	{#if successMessage}
		<div class="success">{successMessage}</div>
	{/if}

	<!-- Form aggiunta articolo -->
	{#if showAddForm}
		<div class="form-section">
			<h2>Aggiungi Nuovo Articolo</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
				<div class="form-grid">
					<div class="form-group">
						<label for="name">Nome *</label>
						<input 
							id="name"
							type="text" 
							bind:value={newItem.name} 
							required 
						/>
					</div>
					<div class="form-group">
						<label for="category">Categoria *</label>
						<input 
							id="category"
							type="text" 
							bind:value={newItem.category} 
							required 
						/>
					</div>
					<div class="form-group">
						<label for="category">Isola *</label>
						<input
								id="category"
								type="number"
								min="1"
								bind:value={newItem.aisle}
								required
						/>
					</div>
					<div class="form-group">
						<label for="price">Prezzo</label>
						<input 
							id="price"
							type="number" 
							step="0.01"
							min="0"
							bind:value={newItem.price} 
						/>
					</div>
					<div class="form-group">
						<label for="section">Sezione *</label>
						<input 
							id="section"
							type="text" 
							bind:value={newItem.section} 
							required 
						/>
					</div>
				</div>
				<div class="form-actions">
					<button type="submit">Aggiungi Articolo</button>
					<button type="button" onclick={resetForm}>Annulla</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Lista articoli -->
	<div class="items-section">
		<h2>Gestione Articoli</h2>
		
		{#if loading}
			<div class="loading">Caricamento...</div>
		{:else if items.length === 0}
			<p class="no-items">Nessun articolo presente</p>
		{:else}
			<div class="items-table">
				<div class="table-header">
					<span>Nome</span>
					<span>Categoria</span>
					<span>Isola</span>
					<span>Prezzo</span>
					<span>Sezione</span>
				</div>
				
				{#each items as item}
					<div class="table-row">
						{#if editingItem && editingItem.id === item.id}
							<input bind:value={editingItem.name} />
							<input bind:value={editingItem.category} />
							<input type="number" min="1" bind:value={editingItem.aisle} />
							<input type="number" step="0.01" min="0" bind:value={editingItem.price} />
							<input bind:value={editingItem.section} />
							<div class="actions">
								<button 
  class="save-btn" 
  onclick={() => editingItem && handleUpdateItem(editingItem)}
>
  Salva
</button>

								<button class="cancel-btn" onclick={cancelEdit}>
									Annulla
								</button>
							</div>
						{:else}
							<span>{item.name}</span>
							<span>{item.category}</span>
							<script>console.log("Read Price")</script>
							<span>{item.aisle}</span>
							<span>€{item.price.toFixed(2)}</span>
							<span>{item.section}</span>
							<div class="actions">
								<button class="edit-btn" onclick={() => startEdit(item)}>
									Modifica
								</button>
								<button class="delete-btn" onclick={() => handleDeleteItem(item.id)}>
									Elimina
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.admin-dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
	}

	.add-btn {
		background: #4CAF50;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 6px;
		cursor: pointer;
		font-weight: bold;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}

	.stat-card {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		text-align: center;
	}

	.stat-card h3 {
		margin: 0 0 10px 0;
		color: #666;
		font-size: 0.9em;
	}

	.stat-number {
		font-size: 2em;
		font-weight: bold;
		color: #4CAF50;
		margin: 0;
	}

	.error, .success {
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
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

	.form-section {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		margin-bottom: 30px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.form-group label {
		font-weight: bold;
		color: #333;
	}

	.form-group input {
		padding: 8px 12px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
	}

	.form-actions {
		display: flex;
		gap: 10px;
	}

	.form-actions button {
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	.form-actions button[type="submit"] {
		background: #4CAF50;
		color: white;
	}

	.form-actions button[type="button"] {
		background: #f5f5f5;
		color: #333;
	}

	.items-section {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.loading {
		text-align: center;
		padding: 40px;
		color: #666;
	}

	.no-items {
		text-align: center;
		color: #666;
		font-style: italic;
		padding: 40px;
	}

	.items-table {
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: #f5f5f5;
		border-radius: 6px;
		overflow: hidden;
	}

	.table-header {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1fr 1.5fr 2fr;
		gap: 10px;
		padding: 15px;
		background: #4CAF50;
		color: white;
		font-weight: bold;
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1fr 1.5fr 2fr;
		gap: 10px;
		padding: 15px;
		background: white;
		align-items: center;
	}

	.table-row input {
		padding: 4px 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.actions {
		display: flex;
		gap: 8px;
	}

	.actions button {
		padding: 6px 12px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		font-weight: bold;
	}

	.edit-btn {
		background: #2196F3;
		color: white;
	}

	.delete-btn {
		background: #f44336;
		color: white;
	}

	.save-btn {
		background: #4CAF50;
		color: white;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #333;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			gap: 15px;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 5px;
		}

		.table-header {
			display: none;
		}

		.table-row {
			display: flex;
			flex-direction: column;
			align-items: stretch;
		}

		.actions {
			justify-content: center;
		}
	}
</style>
