import express from "express";
import { register, login, logout, loginAdmin, registerAdmin, getCookies} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/registeradmin", registerAdmin);
router.post("/login", login);
router.get("/getcookies", getCookies);
router.post("/admin", loginAdmin);
router.post("/logout", logout);

export default router;
