import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { optimizeRoute } from "../utils/optimizeRoute.js"

const DATA_PATH = path.resolve("data", "items.json")

// --- Utility per I/O sul file JSON ---
async function readItemsFile() {
  const data = await fs.readFile(DATA_PATH, "utf-8")
  return JSON.parse(data)
}

async function writeItemsFile(items) {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), "utf-8")
}

// Funzione per mappare i dati backend al formato frontend
function mapItemToFrontend(item) {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    category: item.section, // Mappa section -> category
    section: item.subsection || item.section, // Usa subsection come section
    aisle: item.aisle,
  }
}

// Funzione per mappare i dati frontend al formato backend
function mapItemToBackend(item) {
  return {
    id: item.id || uuidv4(),
    name: item.name,
    price: item.price,
    aisle: item.aisle || 1,
    section: item.category || item.section, // Mappa category -> section
    subsection: item.section || item.category, // Mappa section -> subsection
  }
}

// --- Filtraggio con sezioni / sottosezioni ---
export async function getItems(req, res, next) {
  try {
    const { section, subsection } = req.query
    const allItems = await readItemsFile()

    // Filtro per section/subsection se presenti
    let items = allItems
    if (section) {
      items = items.filter((i) => i.section === section)
      if (subsection) {
        items = items.filter((i) => i.subsection === subsection)
      }
    }

    // Mappa al formato frontend
    const frontendItems = items.map(mapItemToFrontend)

    // Liste uniche per dropdown (sempre dall'intero dataset)
    const sections = [...new Set(allItems.map((i) => i.section))]
    const subsections = section
      ? [...new Set(allItems.filter((i) => i.section === section).map((i) => i.subsection))]
      : []

    res.json({
      items: frontendItems,
      sections,
      subsections,
    })
  } catch (err) {
    next(err)
  }
}

// --- CRUD standard ---
export async function getAllItems(req, res, next) {
  try {
    const items = await readItemsFile()
    // Mappa tutti gli items al formato frontend
    const frontendItems = items.map(mapItemToFrontend)
    res.json(frontendItems)
  } catch (err) {
    next(err)
  }
}

export async function getItemById(req, res, next) {
  try {
    const { id } = req.params
    const items = await readItemsFile()
    const item = items.find((i) => i.id === id)

    if (!item) return res.status(404).json({ message: "Articolo non trovato." })

    res.json(mapItemToFrontend(item))
  } catch (err) {
    next(err)
  }
}

export async function createItem(req, res, next) {
  try {
    const frontendItem = req.body

    // Validazione base
    if (!frontendItem.name || !frontendItem.category) {
      return res.status(400).json({ message: "Nome e categoria sono obbligatori." })
    }

    const items = await readItemsFile()
    const backendItem = mapItemToBackend(frontendItem)

    items.push(backendItem)
    await writeItemsFile(items)

    res.status(201).json(mapItemToFrontend(backendItem))
  } catch (err) {
    next(err)
  }
}

export async function updateItem(req, res, next) {
  try {
    console.log("Getting params...")
    const { id } = req.params
    const frontendItem = req.body
    const items = await readItemsFile()
    const idx = items.findIndex((i) => i.id === id)

    if (idx === -1) return res.status(404).json({ message: "Articolo non trovato." })
    console.log("Check Passed")
    // Aggiorna l'item mantenendo la struttura backend
    const updatedBackendItem = {
      ...items[idx],
      ...mapItemToBackend({ ...frontendItem, id }),
    }

    items[idx] = updatedBackendItem
    await writeItemsFile(items)

    res.json(mapItemToFrontend(updatedBackendItem))
  } catch (err) {
    next(err)
  }
}

export async function deleteItem(req, res, next) {
  try {
    const { id } = req.params
    const items = await readItemsFile()
    const exists = items.some((i) => i.id === id)

    if (!exists) return res.status(404).json({ message: "Articolo non trovato." })

    const filtered = items.filter((i) => i.id !== id)
    await writeItemsFile(filtered)

    res.json({ message: "Articolo eliminato." })
  } catch (err) {
    next(err)
  }
}

// --- Ottimizzazione percorso per selezione utente ---
export async function getOptimizedList(req, res, next) {
  try {
    const { itemIds } = req.body // Cambiato da selectedIds a itemIds per coerenza

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ message: "itemIds deve essere un array." })
    }

    const items = await readItemsFile()
    const selectedItems = items.filter((i) => itemIds.includes(i.id))
    const ordered = optimizeRoute(selectedItems)

    // Mappa al formato frontend
    const frontendOrdered = ordered.map(mapItemToFrontend)

    res.json(frontendOrdered)
  } catch (err) {
    next(err)
  }
}
