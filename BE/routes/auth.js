import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

// POST /api/auth/login
// Modificato per accettare sia username che email e restituire user object
router.post("/login", async (req, res) => {
  const { username, password, email } = req.body

  // Accetta sia username che email per compatibilità
  const loginField = username || email

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // Controlla se il campo login corrisponde all'email admin o se è "admin"
  if (loginField !== adminEmail && loginField !== "admin") {
    return res.status(401).json({ message: "Credenziali non valide." })
  }

  const passwordMatch = await bcrypt.compare(password, adminPasswordHash)
  if (!passwordMatch) {
    return res.status(401).json({ message: "Credenziali non valide." })
  }

  // Payload con user object per compatibilità frontend
  const user = {
    username: "admin",
    email: adminEmail,
    role: "admin",
  }

  const payload = {
    email: adminEmail,
    username: "admin",
    role: "admin",
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  })

  // Risposta coerente con frontend
  res.json({
    token,
    user,
  })
})

export default router
