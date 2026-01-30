import { Router } from "express";
import { signin, initiateAdmin } from "../controllers/auth.controller";

const router = Router();

router.post("/api/auth/signin", signin);
router.post("/api/auth/initiate-admin-user", initiateAdmin);

export default router;
