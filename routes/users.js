import express from "express"
import { approveUser, beneficiosOtorgados, comprobarAfiliados, deleteUser, getAfiliado, getAllAfiliados, getAllUsers, getUsers, registerAfiliate, registerFamiliar, soporte, updateUsers } from "../controllers/user.js";
import multer from "multer";
const router = express.Router()
const plainDataMulter = multer().none();


router.get("/users/:id", getUsers);

router.get("/", getAllUsers);

router.post("/users/update/:id", updateUsers);

router.get("/afiliados", getAllAfiliados);

router.get("/afiliados/:dni", getAfiliado);

router.get("/comprobar-afiliado/:dni", comprobarAfiliados);

// router.get("/familiares/:id", getFamiliares);

router.post("/afiliado-registro", plainDataMulter, registerAfiliate);

router.post("/approved", approveUser);

router.delete("/delete", deleteUser);

router.get("/beneficios-otorgados", beneficiosOtorgados)

router.post("/registro-familiar", registerFamiliar)
router.post("/soporte", soporte)

//TODO


export default router