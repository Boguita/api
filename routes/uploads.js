import express from "express";
import { getImagesByDni, handleMulterError, upload, uploadCertificado, uploadConstancia, uploadDdjj, uploadDni, uploadDniFamiliar, uploadLibreta, uploadRecibo } from "../controllers/uploads.js";

const router = express.Router();

// router.post("/images",upload.array("images", 4), uploadImages);
router.post("/images-dni", upload.array("dni_img", 2), uploadDni);
router.post("/images-dni-familiar", upload.array("dni_img_familiar", 2), uploadDniFamiliar);
router.post("/images-recibo", upload.array("recibo_sueldo", 4), uploadRecibo);
router.put("/images-recibo", upload.array("recibo_sueldo", 4), uploadRecibo);
router.post("/images-libreta", upload.array("libreta", 4), uploadLibreta);
router.post("/images-certificado", upload.array("certificado", 4),handleMulterError, uploadCertificado);
router.post(
  "/images-ddjj",
  upload.array("ddjj", 4),
  handleMulterError, uploadDdjj
);
router.post(
  "/images-constancia",
  upload.single("constancia"),
  handleMulterError, uploadConstancia
);


router.get("/singles/:dni", getImagesByDni);



export default router;
