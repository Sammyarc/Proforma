import { signup, login, logout, checkAuth, googleSignIn } from "../controllers/auth.controller.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google-signin", googleSignIn);
router.get("/check-auth", verifyToken, checkAuth);

export default router