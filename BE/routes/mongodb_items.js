// BE/routes/items.js
import express from "express";
import {
  getItems,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getOptimizedList,
} from "../controllers/mongodb_itemsController.js";

// import default (come sopra)
import authMiddleware from "../middleware/mongodb_authMiddleware.js";

const router = express.Router();

router.get("/", getAllItems);
router.get("/all", getAllItems);
router.get("/:id", getItemById);
router.post("/", authMiddleware, createItem);
router.put("/:id", authMiddleware, updateItem);
router.delete("/:id", authMiddleware, deleteItem);
router.post("/optimize-route", getOptimizedList);

export default router;
