import { browser } from "$app/environment"

const API_BASE_URL = "http://localhost:3000/api"

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string} section
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} role
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @param {string} endpoint
 * @param {RequestInit} [options]
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Forziamo headers a essere un oggetto semplice
  /** @type {Record<string, string>} */
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ? Object.fromEntries(new Headers(options.headers)) : {})
  }

  // Aggiungi il token se disponibile (solo lato client)
  if (browser) {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}")
    if (auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`
    }
  }

  const config = {
    ...options,
    headers
  }

  try {
    const response = await fetch(url, config)
    console.log(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    console.log("Check 2")
    if (contentType && contentType.includes("application/json")) {
      console.log(JSON.stringify(response, null, 2))
      return await response.json()
    }
    return await response.text()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Autenticazione
/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<LoginResponse>}
 */
export async function login(username, password) {
  return await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
}

// Gestione articoli
/**
 * @returns {Promise<Item[]>}
 */
export async function getItems() {
  return await apiRequest("/items")
}

/**
 * @param {Partial<Item>} item
 * @returns {Promise<Item>}
 */
export async function addItem(item) {
  return await apiRequest("/items", {
    method: "POST",
    body: JSON.stringify(item),
  })
}

/**
 * @param {string} id
 * @param {Partial<Item>} item
 * @returns {Promise<Item>}
 */
export async function updateItem(id, item) {
  console.log("Check 1")
  return await apiRequest(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  })
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteItem(id) {
  return await apiRequest(`/items/${id}`, {
    method: "DELETE",
  })
}

/**
 * @param {string[]} itemIds
 * @returns {Promise<Item[]>}
 */
export async function optimizeRoute(itemIds) {
  return await apiRequest("/items/optimize-route", {
    method: "POST",
    body: JSON.stringify({ itemIds }),
  })
}
