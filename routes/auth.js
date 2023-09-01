import express from "express";
import { register, login, logout, loginAdmin, registerAdmin, getCookies, passwordForgot, resetPassword} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/forgot-password", passwordForgot);
router.post("/reset-password/:id/:token", resetPassword);
router.post("/registeradmin", registerAdmin);
router.post("/login", login);
router.get("/getcookies", getCookies);
router.post("/admin", loginAdmin);
router.post("/logout", logout);

export default router;
