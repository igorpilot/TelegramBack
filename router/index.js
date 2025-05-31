import { Router } from 'express';
import UserController from "../controllers/user-controller.js";
const router = Router();

router.post("/telegram-auth", UserController.telegramAuth);
router.post("/claim-coins", UserController.claimCoins);
router.post("/collectPassiveIncome", UserController.collectPassiveIncome);
router.put("/update", UserController.updateUser);
router.post("/dailyReward/:id", UserController.dailyReward);
router.get("/friends/:id", UserController.getFriends);
router.post("/task", UserController.postTask)
router.get("/tasks", UserController.getTasks)
router.post("/checkTask/:id", UserController.checkTask)
router.post('/lottery/:id', UserController.ticketUse);
router.put('/lottery/used/:id', UserController.ticketUsed);

export default router;