import { Router } from "express";
import {
  createBank,
  getBankById,
  updateBank,
  deleteBank,
  getBank,
} from "../controllers/bank.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createBank);
router.get("/", getBank);
router.get("/:id", getBankById);
router.patch("/:id", authenticate, updateBank);
router.delete("/:id", authenticate, deleteBank);

export default router;
