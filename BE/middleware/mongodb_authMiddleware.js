// BE/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET } = process.env;

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token mancante o formato errato." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // se vuoi, puoi attaccare il payload a req.user
    // req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token non valido." });
  }
}
