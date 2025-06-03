<!-- src/routes/optimized/+page.svelte -->
<script>
  /**
   * @typedef {Object} Item
   * @property {string} id
   * @property {string} name
   * @property {number} aisle
   */

  /** @type {Item[]} */
  let optimizedList = [];

  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    const raw = sessionStorage.getItem("optimizedList");
    if (raw) {
      // Qui sappiamo che sessionStorage contiene un array di Item in formato JSON
      optimizedList = /** @type {Item[]} */ (JSON.parse(raw));
    } else {
      // Se non trovo nulla, torno alla home
      goto("/");
    }
  });
</script>

<style>
  main {
    padding: 1rem;
  }
  h1 {
    text-align: center;
    margin-bottom: 1rem;
  }
  .shopping-container {
    padding: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }
  ol {
    padding-left: 1.2rem;
  }
  li {
    margin: 0.5rem 0;
  }
</style>

<main>
  <h1>Lista della Spesa Ottimizzata</h1>
  <div class="shopping-container">
    {#if optimizedList.length === 0}
      <p>Nessun articolo da mostrare.</p>
    {:else}
      <ol>
        {#each optimizedList as item (item.id)}
          <li>{item.name} (corsia {item.aisle})</li>
        {/each}
      </ol>
    {/if}
  </div>
</main>
