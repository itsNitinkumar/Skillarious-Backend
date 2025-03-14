import express, { Router } from "express";
import { login, signUp, refreshToken, logout, resetPassword, forgotPassword } from "../controllers/Auth.ts";
const router = express.Router();
router.post("/login", login);
 router.post("/signup",signUp);
 router.post("/refreshtoken",refreshToken);
router.post("/logout", logout);
 router.post("/forgotPassword", forgotPassword);
 router.post("/resetPassword", resetPassword);
export default router;



