import express from "express"
import {
  getItems,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getOptimizedList,
} from "../controllers/itemsController.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Route base per compatibilità frontend
router.get("/", getAllItems)
router.get("/all", getAllItems)
router.get("/filtered", getItems) // Spostato il filtering su route separata
router.get("/:id", getItemById)
router.post("/", authMiddleware, createItem)
router.put("/:id", authMiddleware, updateItem)
router.delete("/:id", authMiddleware, deleteItem)

// Route ottimizzazione coerente con frontend
router.post("/optimize-route", getOptimizedList)

export default router
