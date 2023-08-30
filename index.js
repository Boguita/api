import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import uploadRoutes from "./routes/uploads.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
app.use(express.json());
app.use(cookieParser());
const port = procces.env.PORT || 8800;

app.use(
  cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use((req, res, next) => {
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Otras cabeceras CORS si es necesario
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});


// Obtiene la ruta del archivo actual (index.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construye la ruta para el directorio "uploads" a partir de la ruta actual
const uploadsDirectory = join(__dirname, "uploads");

app.use("/", (req, res) => {
  res.send("Hello World!");
});
  
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", postRoutes);
app.use("/uploads", express.static(uploadsDirectory));
app.use("/api/uploads", uploadRoutes );

app.listen(port, () => {
  console.log("Connected!");
});
