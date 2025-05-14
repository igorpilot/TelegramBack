import { Router } from 'express';
import UserController from "../controllers/user-controller.js";
const router = Router();

router.post("/telegram-auth", UserController.telegramAuth);
router.post("/claim-coins", UserController.claimCoins);
router.post("/collectPassiveIncome", UserController.collectPassiveIncome);
router.post("/logout", UserController.logout);
router.post("/dailyReward", UserController.dailyReward);
export default router;