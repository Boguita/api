import express from "express";
import {
  comprobarBeneficios,
  getBeneficiosByDni,
  getPosts,
  otorgarBeneficio,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", otorgarBeneficio);
router.get("/beneficio/:dni", getBeneficiosByDni);
router.get("/verified-kit-escolar/:familiar_ids", comprobarBeneficios);



export default router;
