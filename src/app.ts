import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import bankRoutes from "./routes/bank.routes";
import transactionRoutes from "./routes/transaction.routes";
import { authenticate } from "./middlewares/auth.middleware";
import path from "path";
import config from "./config";

const app = express();

if (config.isDevelopment) {
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
} else {
  app.use(
    cors({
      origin: "https://ikhfad-sporton-fe.vercel.app",
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  "/categories",
  express.static(path.join(__dirname, "../uploads/categories")),
);
app.use(
  "/products",
  express.static(path.join(__dirname, "../uploads/products")),
);
app.use(
  "/transactions",
  express.static(path.join(__dirname, "../uploads/transactions")),
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../docs/api.html"));
});

app.get("/test-middleware", authenticate, (_req, res) => {
  res.send("This endpoint is protected");
});

export default app;
