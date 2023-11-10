import express from "express";
import {
  comprobarBeneficioKitMaternal,
  comprobarBeneficios,
  comprobarStockEscolar,
  stockEscolarProvincia,
  comprobarStockMaternal,
  createSeccional,
  deleteSeccional,
  editStockEscolar,
  getBeneficios,
  getBeneficiosByDni,
  getKitEscolar,
  getKitEscolarExcel,
  getKitMaternal,
  getKitMaternalExcel,
  getLunaDeMiel,
  getSeccionales,
  otorgarBeneficio,
  updateEstadoBeneficio,
  editStockEscolarIndividual,
  editStockMaternal,
  stockMaternalProvincia,
  getStockEscolar,
  getStockEscolarEnviado,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getBeneficios);
router.get("/luna-de-miel", getLunaDeMiel);
router.get("/kit-maternal", getKitMaternal);
router.get("/kit-escolar", getKitEscolar);
router.post("/", otorgarBeneficio);
router.get("/seccionales", getSeccionales);
router.delete("/seccionales/:id", deleteSeccional);
router.post("/seccional", createSeccional);
router.get("/stock", getStockEscolar);
router.get("/stock-enviado", getStockEscolarEnviado);
router.get('/stock-maternal/:seccional', comprobarStockMaternal);
router.get("/stock-maternal-provincia/:provincia", stockMaternalProvincia);
router.put("/stock-maternal/:seccionales", editStockMaternal);
router.get('/stock-escolar/:seccional', comprobarStockEscolar)
router.put('/stock-escolar/:seccionales', editStockEscolar)
router.put("/stock-escolar-individual/:seccionales", editStockEscolarIndividual);
router.get("/stock-escolar-provincia/:provincia", stockEscolarProvincia);
router.get("/beneficio/:dni", getBeneficiosByDni);
router.get("/verified-kit-escolar/:familiar_ids", comprobarBeneficios);
router.get("/verified-kit-maternal/:familiar_id", comprobarBeneficioKitMaternal)
router.put("/:beneficio_id", updateEstadoBeneficio)
router.get("/kit-escolar/excel", getKitEscolarExcel)
router.get("/kit-maternal/excel", getKitMaternalExcel);



export default router;
