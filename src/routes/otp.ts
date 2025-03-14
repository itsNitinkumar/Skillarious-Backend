import express from "express";
import {generateOtp, verifyOtp} from "../controllers/Otp.ts";
const router = express.Router();
router.post("/generate",generateOtp);
router.post("/verify",verifyOtp);
export default router;
