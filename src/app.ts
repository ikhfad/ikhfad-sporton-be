import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import { authenticate } from "./middlewares/auth.middleware";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(authRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (_req, res) => {
  res.send({ message: "Sporton Backend API is running truly" });
});

app.get("/test-middleware", authenticate, (_req, res) => {
  res.send("This endpoint is cannot be accessed publicly");
});

export default app;
