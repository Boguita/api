import express from "express";
import {
  comprobarBeneficioKitMaternal,
  comprobarBeneficios,
  getBeneficios,
  getBeneficiosByDni,
 
  getKitEscolarExcel,
 
  getKitMaternalExcel,
 
  otorgarBeneficio,
  updateEstadoBeneficio,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getBeneficios);
router.post("/", otorgarBeneficio);
router.get("/beneficio/:dni", getBeneficiosByDni);
router.get("/verified-kit-escolar/:familiar_ids", comprobarBeneficios);
router.get("/verified-kit-maternal/:familiar_id", comprobarBeneficioKitMaternal)
router.put("/:beneficio_id", updateEstadoBeneficio)
router.get("/kit-escolar/excel", getKitEscolarExcel)
router.get("/kit-maternal/excel", getKitMaternalExcel);



export default router;
