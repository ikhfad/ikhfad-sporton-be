import { Router } from "express";
import {
  createBank,
  getBankById,
  updateBank,
  deleteBank,
  getBanks,
} from "../controllers/bank.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createBank);
router.get("/", getBanks);
router.get("/:id", getBankById);
router.patch("/:id", authenticate, updateBank);
router.delete("/:id", authenticate, deleteBank);

export default router;
