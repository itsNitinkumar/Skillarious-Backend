import express from "express";
import { 
    login, 
    signUp, 
    refreshToken, 
    logout, 
    authenticateUser, 
    validateSession 
} from "../controllers/Auth.ts";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/refreshtoken", refreshToken);
router.post("/logout", logout);
router.get("/validate", authenticateUser as express.RequestHandler, validateSession as unknown as express.RequestHandler);

export default router;
