<script>
	import ItemSelector from "$lib/components/ItemSelector.svelte";

	/**
	 * @typedef {{
	 *   id: string,
	 *   name: string,
	 *   price: number,
	 *   aisle: number,
	 *   section: string,
	 *   subsection: string
	 * }} Item
	 */

	/** @type {Item[]} */
	let cart = [];

	/** @type {boolean} */
	let showCart = false;

	/**
	 * Gestisce l'evento addToCart emesso da ItemSelector.
	 * @param {{ detail: { ordered: Item[] } }} event
	 */
	function handleAddToCart(event) {
		console.log("🟢 Evento 'addToCart' ricevuto in App.svelte");
		console.log("📦 Dettagli dell'evento:", event.detail);

		const incoming = event.detail.ordered;
		console.log("📥 Articoli ricevuti da ItemSelector:", incoming);

		// Ordina per sezione e poi per corsia
		cart = [...incoming].sort((a, b) => {
			if (a.section === b.section) return a.aisle - b.aisle;
			return a.section.localeCompare(b.section);
		});

		console.log("🛒 Carrello aggiornato e ordinato:", cart);
		showCart = true;
		console.log("👁️ showCart è ora:", showCart);
	}

	function toggleCart() {
		showCart = !showCart;
		console.log("🔁 Toggle Carrello. Nuovo valore showCart:", showCart);
	}
</script>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f5f5f5;
    }
    .cart {
        padding: 1rem;
    }
    .cart ul {
        list-style: none;
        padding: 0;
    }
    .cart li {
        margin: 0.5rem 0;
    }
</style>

<div>
	<div class="header">
		<h1>La tua Spesa</h1>
		<button on:click={toggleCart}>
			{showCart ? "Chiudi Carrello" : "Apri Carrello"} ({cart.length})
		</button>
	</div>

	{#if showCart}
		<div class="cart">
			<h2>Carrello</h2>
			{#if cart.length}
				<ul>
					{#each cart as item}
						<li>
							<strong>{item.section}</strong> &gt; {item.subsection}:
							{item.name} (corsia {item.aisle})
						</li>
					{/each}
				</ul>
			{:else}
				<p>Il carrello è vuoto.</p>
			{/if}
		</div>
	{/if}

	<ItemSelector on:addToCart={handleAddToCart} />
</div>