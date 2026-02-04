import { Router } from "express";
import {
  createTransaction,
  getTransactionById,
  updateTransaction,
  getTransactions,
} from "../controllers/transaction.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/checkout",
  authenticate,
  upload.transactions.single("image"),
  createTransaction,
);
router.get("/", authenticate, getTransactions);
router.get("/:id", getTransactionById);
router.patch("/:id", authenticate, updateTransaction);

export default router;
