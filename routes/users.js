import express from "express"
import { approveUser, beneficiosOtorgados, comprobarAfiliados, deleteUser, getAfiliado, getAllAfiliados, getUsers, registerAfiliate, registerFamiliar, updateUsers } from "../controllers/user.js";
import multer from "multer";
const router = express.Router()
const plainDataMulter = multer().none();

console.log("Configurando ruta GET /users/:id...");
router.get("/users/:id", getUsers);
console.log("Configurando ruta POST /users/update/:id...");
router.post("/users/update/:id", updateUsers);
console.log("Configurando ruta POST /users/afiliados...");
router.get("/afiliados", getAllAfiliados);
console.log("Configurando ruta POST /users/afiliado/:dni...");
router.get("/afiliados/:dni", getAfiliado);
console.log("Configurando ruta POST /users/comprobar-afiliado/:dni...");
router.get("/comprobar-afiliado/:dni", comprobarAfiliados);

// router.get("/familiares/:id", getFamiliares);
console.log("Configurando ruta POST /users/afiliado-registro...");
router.post("/afiliado-registro", plainDataMulter, registerAfiliate);
console.log("Configurando ruta POST /users/approved...");
router.post("/approved", approveUser);
console.log("Configurando ruta POST /users/delete...");
router.delete("/delete", deleteUser);
console.log("Configurando ruta POST /users/beneficios-otorgados...");
router.get("/beneficios-otorgados/:user", beneficiosOtorgados)
console.log("Configurando ruta POST /users/registro-familiar...");
router.post("/registro-familiar", registerFamiliar)


//TODO


export default router