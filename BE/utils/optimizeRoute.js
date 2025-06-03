/**
 * optimizeRoute(selectedItems: Array<{id,name,aisle}>): Array<{id,name,aisle}>
 * Restituisce la lista di articoli nell’ordine ottimale (qui: sort by aisle).
 */
export function optimizeRoute(selectedItems) {
  return [...selectedItems].sort((a, b) => a.aisle - b.aisle);
}
