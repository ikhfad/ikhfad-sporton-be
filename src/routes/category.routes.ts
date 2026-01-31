import { Router } from "express";
import {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategories,
} from "../controllers/category.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, upload.extended.single("image"), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put(
  "/id",
  authenticate,
  upload.extended.single("images"),
  updateCategory,
);
router.delete("/:id", authenticate, deleteCategory);

export default router;
