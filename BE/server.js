import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import itemsRoutes from "./routes/items.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(bodyParser.json())

// Rotte
app.use("/api/auth", authRoutes)
app.use("/api/items", itemsRoutes)

// Errore generico
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: "Errore interno al server." })
})

// Cambiato da 4000 a 3000 per coerenza con frontend
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`)
})
