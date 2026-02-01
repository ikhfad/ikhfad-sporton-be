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

router.post(
  "/",
  authenticate,
  upload.categories.single("image"),
  createCategory,
);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.patch(
  "/:id",
  authenticate,
  upload.categories.single("image"),
  updateCategory,
);
router.delete("/:id", authenticate, deleteCategory);

export default router;
