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
const port = process.env.PORT || 8800;
app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: ["https://client-zeta-weld.vercel.app"],
    credentials: true,
  })
);


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

app.options("/api/auth/*", cors());
app.options("/api/users/*", cors());
app.options("/api/tasks/*", cors());
app.options("/api/uploads/*", cors());


// Obtiene la ruta del archivo actual (index.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construye la ruta para el directorio "uploads" a partir de la ruta actual
const uploadsDirectory = join(__dirname, "uploads");

// app.use("/", (req, res) => {
//   res.send("Hello World!");
// });
console.log("Configuring auth routes..."); 
app.use("/api/auth", authRoutes);
console.log("Configuring auth routes...");
app.use("/api/users", userRoutes);
console.log("Configuring auth routes...");
app.use("/api/tasks", postRoutes);
console.log("Configuring auth routes...");
app.use("/uploads", express.static(uploadsDirectory));
console.log("Configuring auth routes...");
app.use("/api/uploads", uploadRoutes );
// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);


app.listen(port, () => {
  console.log("Connected!");
});

export default app;