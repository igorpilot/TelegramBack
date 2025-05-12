import { Router } from 'express';
import UserController from "../controllers/user-controller.js";
const router = Router();

router.post("/telegram-auth", UserController.telegramAuth);

export default router;