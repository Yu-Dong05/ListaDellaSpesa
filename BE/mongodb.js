import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import itemsRoutes from "./routes/mongodb_items.js";

dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());

// Rotte
app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);

// Errore generico
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Errore interno al server." });
});


const startServer = async () => {
    console.log("Starting server");
    app.listen(process.env.PORT, () => {
        console.log("Database listening on port", process.env.PORT);
    });
}

startServer()