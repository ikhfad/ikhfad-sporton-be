import { Router } from "express";
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts,
} from "../controllers/product.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, upload.extended.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.patch(
  "/:id",
  authenticate,
  upload.standard.single("image"),
  updateProduct,
);
router.delete("/:id", authenticate, deleteProduct);

export default router;
