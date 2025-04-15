
import express from "express";
import { 
    login, 
    signUp, 
    refreshToken, 
    logout, 
    authenticateUser, 
    forgotPassword,
    validateSession ,
    resetPassword
} from "../controllers/Auth.ts";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/refreshtoken", refreshToken);
router.post("/logout", logout);
router.post("/forgotpassword", forgotPassword as unknown as express.RequestHandler);
router.post("/resetpassword", resetPassword as unknown as express.RequestHandler);

router.get("/validate", authenticateUser as express.RequestHandler, validateSession as unknown as express.RequestHandler);

export default router;
