import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import {optimizeRoute} from "../utils/optimizeRoute.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {MongoClient, ServerApiVersion} from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

let database;
let prodotti;
let gestori;
const BASE_URL = "http://localhost:" + PORT + "/api/";

async function connectToDatabase() {
    try{
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');
        return client.db('database');
    }catch(e){
        console.log(e)
        console.log("Connection Failed")
        process.exit(1);
    }

}

async function checkDatabase() {
    if (!database) {
        try {
            database = await connectToDatabase();
            prodotti = await database.collection('prodotto');
            gestori = await database.collection('gestore');
            console.log('Database Initialized')
            return true
        } catch (e) {
            console.log(e)
            console.log('Database Failed')
            return false
        }
    }
    return true;
}

async function devGetAll(){
    if (await checkDatabase()){
        try {
            return prodotti.find({}).toArray();
        } catch (e) {
            console.log(e)
        }
    } else {
        return [];
    }
}

// Funzione per mappare i dati backend al formato frontend
function mapItemToFrontend(item) {
    return {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.section, // Mappa section -> category
        section: item.subsection, // Usa subsection come section
        aisle: item.aisle,
    }
}

// Funzione per mappare i dati frontend al formato backend
function mapItemToBackend(item) {
    return {
        id: item.id,
        name: item.name,
        price: item.price,
        aisle: item.aisle || 1,
        section: item.category, // Mappa category -> section
        subsection: item.section, // Mappa section -> subsection
    }
}

export async function getItems(req, res, next) {
    if (await checkDatabase()) {
        try {
            const { section, subsection } = req.query;
            const allItems = await devGetAll();

            // Filtro per section/subsection se presenti
            let items = allItems;
            if (section) {
                items = items.filter(i => i.section === section);
                if (subsection) {
                    items = items.filter(i => i.subsection === subsection);
                }
            }

            // Liste uniche per dropdown (sempre dall'intero dataset)
            const sections = [...new Set(allItems.map(i => i.section))];
            const subsections = section
                ? [...new Set(allItems.filter(i => i.section === section).map(i => i.subsection))]
                : [];

            res.json({ items, sections, subsections });
        } catch (err) {
            next(err);
        }
    } else {
        res.status(500).send("Server Error");
    }
}

// --- CRUD standard ---
export async function getAllItems(req, res, next) {
    if (await checkDatabase()){
        try {
            const result = await prodotti.find({}).toArray();
            const frontendItems = result.map(mapItemToFrontend);
            res.json(frontendItems);
        } catch (e) {
            res.json(e)
        }
    } else {
        res.status(500).send('Server Error');
    }
}

export async function getItemById(req, res, next) {
    if (await checkDatabase()){
        try {
            const { id } = req.params;
            const result = await prodotti.find({id: id}).toArray();
            if (!result) return res.status(404).json({ message: "Articolo non trovato." });
            res.json(result);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(500).send('Server Error');
    }
}

export async function createItem(req, res, next) {
    if (await checkDatabase()){
        try {
            const frontendItem = req.body
            // Validazione base
            if (!frontendItem.name || !frontendItem.category) {
                return res.status(400).json({ message: "Nome e categoria sono obbligatori." })
            }
            const backendItem = mapItemToBackend(frontendItem)
            backendItem.id = uuidv4();
            console.log(backendItem);
            const result = prodotti.insertOne(backendItem);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(500).send('Server Error');
    }
}

export async function updateItem(req, res, next) {
    if (await checkDatabase()){
        try {
            const { id } = req.params;
            const frontendItem = req.body
            console.log(frontendItem)

            if (!prodotti.findOne({id: id})) {
                res.status(404).json({ message: "Prodotto non trovato"});
            }

            const updatedBackendItem = mapItemToBackend(frontendItem);

            console.log(updatedBackendItem);

            const result = prodotti.updateOne({id: id}, {$set: updatedBackendItem});
            res.json(result);
        } catch (err) {
            next(err);
        }
    } else {
        res.status(500).send('Server Error');
    }
}

export async function deleteItem(req, res, next) {
    if (await checkDatabase()){
        try {
            const { id } = req.params;
            if (!prodotti.findOne({id: id})) {
                res.status(404).json({ message: "Prodotto non trovato"});
            }

            const result = await prodotti.deleteOne({id: id});
            res.json({result});
        } catch (err) {
            next(err);
        }
    } else {
        res.status(500).send('Server Error');
    }
}

// --- Ottimizzazione percorso per selezione utente ---
export async function getOptimizedList(req, res, next) {
    try {
        const { itemIds } = req.body;
        console.log("Sorting: " + itemIds);
        if (!Array.isArray(itemIds)) {
            return res.status(400).json({ message: "selectedIds deve essere un array." });
        }

        const items = await devGetAll();
        const selectedItems = items.filter(i => itemIds.includes(i.id));
        const ordered = optimizeRoute(selectedItems);
        res.json(ordered);
    } catch (err) {
        next(err);
    }
}


