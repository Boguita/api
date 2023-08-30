import express from "express"
import { approveUser, beneficiosOtorgados, comprobarAfiliados, deleteUser, getAfiliado, getAllAfiliados, getUsers, registerAfiliate, registerFamiliar, updateUsers } from "../controllers/user.js";
import multer from "multer";
const router = express.Router()
const plainDataMulter = multer().none();

router.get("/users/:id", getUsers);
router.post("/users/update/:id", updateUsers);
router.get("/afiliados", getAllAfiliados);
router.get("/afiliados/:dni", getAfiliado);
router.get("/comprobar-afiliado/:dni", comprobarAfiliados);
// router.get("/familiares/:id", getFamiliares);
router.post("/afiliado-registro", plainDataMulter, registerAfiliate);
router.post("/approved", approveUser);
router.delete("/delete", deleteUser);
router.get("/beneficios-otorgados/:user", beneficiosOtorgados)
router.post("/registro-familiar", registerFamiliar)


//TODO


export default router