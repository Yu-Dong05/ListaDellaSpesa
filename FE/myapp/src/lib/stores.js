import { writable, derived } from "svelte/store"
import { browser } from "$app/environment"

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} role
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {User|null} user
 * @property {string|null} token
 */

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {number} quantity
 */

// Store per l'autenticazione
function createAuthStore() {
  /** @type {AuthState} */
  const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
  }

  const { subscribe, set } = writable(initialState)

  return {
    subscribe,
    /**
     * @param {string} token
     * @param {User} user
     */
    login: (token, user) => {
      const authData = { isAuthenticated: true, user, token }
      set(authData)
      if (browser) {
        localStorage.setItem("auth", JSON.stringify(authData))
      }
    },
    logout: () => {
      set(initialState)
      if (browser) {
        localStorage.removeItem("auth")
        localStorage.removeItem("cart")
      }
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem("auth")
        if (stored) {
          try {
            const authData = JSON.parse(stored)
            set(authData)
          } catch (e) {
            console.error("Error parsing stored auth:", e)
          }
        }
      }
    },
  }
}

// Store per il carrello
function createCartStore() {
  /** @type {CartItem[]} */
  const initialCart = []
  const { subscribe, set, update } = writable(initialCart)

  return {
    subscribe,
    /**
     * @param {CartItem} item
     */
    addItem: (item) => {
      update((cart) => {
        const existingIndex = cart.findIndex((i) => i.id === item.id)
        if (existingIndex >= 0) {
          cart[existingIndex].quantity += item.quantity
        } else {
          cart.push({ ...item })
        }
        if (browser) {
          localStorage.setItem("cart", JSON.stringify(cart))
        }
        return cart
      })
    },
    /**
     * @param {string} itemId
     */
    removeItem: (itemId) => {
      update((cart) => {
        const newCart = cart.filter((item) => item.id !== itemId)
        if (browser) {
          localStorage.setItem("cart", JSON.stringify(newCart))
        }
        return newCart
      })
    },
    /**
     * @param {string} itemId
     * @param {number} quantity
     */
    updateQuantity: (itemId, quantity) => {
      update((cart) => {
        const item = cart.find((i) => i.id === itemId)
        if (item) {
          item.quantity = Math.max(0, quantity)
          if (item.quantity === 0) {
            const newCart = cart.filter((i) => i.id !== itemId)
            if (browser) {
              localStorage.setItem("cart", JSON.stringify(newCart))
            }
            return newCart
          }
        }
        if (browser) {
          localStorage.setItem("cart", JSON.stringify(cart))
        }
        return cart
      })
    },
    clear: () => {
      set([])
      if (browser) {
        localStorage.removeItem("cart")
      }
    },
    init: () => {
      if (browser) {
        const stored = localStorage.getItem("cart")
        if (stored) {
          try {
            const cartData = JSON.parse(stored)
            set(cartData)
          } catch (e) {
            console.error("Error parsing stored cart:", e)
          }
        }
      }
    },
  }
}

export const auth = createAuthStore()
export const cart = createCartStore()

// Store derivati
export const cartTotal = derived(cart, ($cart) => $cart.reduce((total, item) => total + item.price * item.quantity, 0))

export const cartItemCount = derived(cart, ($cart) => $cart.reduce((count, item) => count + item.quantity, 0))

export const isAdmin = derived(auth, ($auth) => $auth.isAuthenticated && $auth.user?.role === "admin")
