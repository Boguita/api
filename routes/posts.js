import express from "express";
import {
  addPost,
  comprobarBeneficios,
  deletePost,
  getAll,
  getBeneficiosByDni,
  getPost,
  getPosts,
  otorgarBeneficio,
  updatePost,
} from "../controllers/post.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", otorgarBeneficio);
router.get("/beneficio/:dni", getBeneficiosByDni);
router.get("/verified-kit-escolar/:familiar_ids", comprobarBeneficios);



export default router;
