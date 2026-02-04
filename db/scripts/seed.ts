import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Model Imports
import Category from "../../src/models/category.model";
import Product from "../../src/models/product.model";
import User from "../../src/models/user.model";
import Bank from "../../src/models/bank.model";
import Transaction from "../../src/models/transaction.model";

// --- Configuration ---

// Initialize dotenv
dotenv.config();

// Use the same ENV variable as server.ts, fallback to localhost for local development
const DB_URI =
  process.env.APP_MONGO_URI || "mongodb://localhost:27017/your_db_name";

// Resolves to: project_root/uploads (Matches app.ts static path setup)
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

// Resolves to: project_root/db (Source of mock files)
const MOCKUP_BASE_DIR = path.join(__dirname, "..");

// --- Types for Raw Data ---
interface IRawCategory {
  name: string;
  file: string;
  description?: string;
}

interface IRawProduct {
  name: string;
  file: string;
  categoryName: string;
  price: number;
  stock: number;
  description?: string;
}

// --- Helper Functions ---

/**
 * REPLICATES MIDDLEWARE LOGIC
 * 1. Ensures directory exists.
 * 2. Generates filename matching middleware logic.
 */
const processFile = (fileName: string, subfolder: string): string => {
  // A. Replicate "destination" logic
  const targetDir = path.join(UPLOAD_BASE_DIR, subfolder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // B. Replicate "filename" logic
  // Logic: cleanName + "-" + suffix + extension
  const parsed = path.parse(fileName);
  const cleanName = parsed.name.replace(/\s+/g, "-").toLowerCase();
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const newFileName = `${cleanName}-${suffix}${parsed.ext}`;

  // C. File Operation
  const sourcePath = path.join(MOCKUP_BASE_DIR, subfolder, fileName);
  const destinationPath = path.join(targetDir, newFileName);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`📁 Copied: ${fileName} -> ${subfolder}`);
  } else {
    console.warn(`⚠️  Source file not found: ${sourcePath}`);
  }

  // Return relative path for DB storage
  return path.join(subfolder, newFileName).replace(/\\/g, "/");
};

/**
 * REPLICATES CONTROLLER LOGIC
 * Deletes the physical file from the uploads folder based on the relative path.
 */
const deleteFile = (
  relativeUrl: string | null | undefined,
  subfolder: string,
) => {
  if (!relativeUrl) return;

  // Extract filename from path (handles both "file.png" and "categories/file.png")
  const fileName = path.basename(relativeUrl);
  const physicalPath = path.join(UPLOAD_BASE_DIR, subfolder, fileName);

  if (fs.existsSync(physicalPath)) {
    fs.unlinkSync(physicalPath);
    console.log(`🗑️  Deleted old file: ${fileName}`);
  } else {
    console.log(`ℹ️  File not found on disk (skipped): ${physicalPath}`);
  }
};

// --- Raw Data Constants ---

const RAW_USER = {
  name: "Sporton Admin",
  email: "sporton@admin.com",
  password: "admin123",
};

const RAW_BANKS = [
  {
    bankName: "BCA",
    accountNumber: 123123,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "Mandiri",
    accountNumber: 1212312313123,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "BRI",
    accountNumber: 1123123123,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "BNI",
    accountNumber: 9876543210,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "BSI",
    accountNumber: 7141234567,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "CIMB Niaga",
    accountNumber: 860012345600,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "Permata Bank",
    accountNumber: 4101234567,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "Bank Danamon",
    accountNumber: 3612345678,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "Bank Tabungan Negara (BTN)",
    accountNumber: 1002345678,
    accountName: "PT SportOn Digital Indonesia",
  },
  {
    bankName: "Bank OCBC NISP",
    accountNumber: 545800012345,
    accountName: "PT SportOn Digital Indonesia",
  },
];

const RAW_CATEGORIES: IRawCategory[] = [
  { name: "Badminton", file: "category-badminton.png" },
  { name: "Basketball", file: "category-basketball.png" },
  { name: "Football", file: "category-football.png" },
  { name: "Running", file: "category-running.png" },
  { name: "Swimming", file: "category-swimming.png" },
  { name: "Tennis", file: "category-tennis.png" },
];

const RAW_PRODUCTS: IRawProduct[] = [
  {
    name: "Ace Pro Graphite Racket",
    file: "ace-tennis-racket.png",
    categoryName: "Tennis",
    price: 120000,
    stock: 15,
  },
  {
    name: "Official Size 7 Basketball",
    file: "official-size-basketball.png",
    categoryName: "Basketball",
    price: 450000,
    stock: 50,
  },
  {
    name: "Elite Pro Dry Jersey",
    file: "pro-dry-jersey-red.png",
    categoryName: "Football",
    price: 350000,
    stock: 100,
  },
  {
    name: "Stealth Training Tee",
    file: "stealth-training-tee.png",
    categoryName: "Running",
    price: 250000,
    stock: 80,
  },
  {
    name: "Striker V2 Elite Cleats",
    file: "striker-soccer-cleats.png",
    categoryName: "Football",
    price: 850000,
    stock: 20,
  },
  {
    name: "Vanguard Cloud-Walkers",
    file: "vanguard-running-shoes.png",
    categoryName: "Running",
    price: 1100000,
    stock: 12,
  },
];

// --- Main Seed Logic ---

async function seed() {
  console.log("🚀 Starting database seed...");

  try {
    // 1. Connect to DB
    await mongoose.connect(DB_URI);
    console.log(`✅ Connected to database: ${DB_URI}`);

    // 2. Cleanup existing images BEFORE wiping DB
    // We fetch them to know which files to delete
    console.log("🧹 Cleaning up old images...");

    const [categories, products, transactions] = await Promise.all([
      Category.find().select("imageUrl"),
      Product.find().select("imageUrl"),
      Transaction.find().select("paymentProof"),
    ]);

    // Delete Category Images
    categories.forEach((category) =>
      deleteFile(category.imageUrl, "categories"),
    );

    // Delete Product Images
    products.forEach((product) => deleteFile(product.imageUrl, "products"));

    // Delete Transaction Proofs
    transactions.forEach((transaction) =>
      deleteFile(transaction.paymentProof, "transactions"),
    );

    // 2.5. Clear Database Data
    console.log("🗑️  Wiping database collections...");
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Bank.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    // 3. Seed User (with hashed password)
    console.log("👤 Seeding User...");
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(RAW_USER.password, salt);

    const user = await User.create({
      name: RAW_USER.name,
      email: RAW_USER.email,
      password: hashedPassword,
    });
    console.log(`✅ User created: ${user.email}`);

    // 4. Seed Banks
    console.log("🏦 Seeding Banks...");
    const banks = await Bank.insertMany(RAW_BANKS);

    // 5. Seed Categories
    console.log("🏷️  Seeding Categories...");
    const categoryDocs = await Category.insertMany(
      RAW_CATEGORIES.map((categories) => ({
        name: categories.name,
        description:
          categories.description ||
          `Premium equipment for ${categories.name} enthusiasts.`,
        // Pass "categories" subfolder
        imageUrl: processFile(categories.file, "categories"),
      })),
    );

    // Create a map for easy category lookup by name
    const categoryMap = new Map(categoryDocs.map((c) => [c.name, c._id]));

    // 6. Seed Products
    console.log("🛍️  Seeding Products...");
    const productDocs = await Product.insertMany(
      RAW_PRODUCTS.map((p) => {
        const catId = categoryMap.get(p.categoryName);
        if (!catId) {
          throw new Error(
            `Category "${p.categoryName}" not found for product "${p.name}"`,
          );
        }

        return {
          name: p.name,
          description:
            p.description ||
            `Professional-grade ${p.name.toLowerCase()} for high performance.`,
          price: p.price,
          stock: p.stock,
          category: catId,
          // Pass "products" subfolder
          imageUrl: processFile(p.file, "products"),
        };
      }),
    );

    // 7. Seed Transactions
    console.log("💳 Seeding Transactions...");
    const basketball = productDocs.find((p) => p.name.includes("Basketball"));
    const vanguard = productDocs.find((p) => p.name.includes("Vanguard"));

    if (basketball && vanguard) {
      await Transaction.create({
        customerName: "John Doe Nyawit",
        customerContact: "08123456789",
        customerAddress: "123 Sport Street, Athlete City",
        status: "pending",
        totalPayment: basketball.price * 3 + vanguard.price * 2,
        // Pass "transactions" subfolder
        paymentProof: processFile("payment-proof-dummy.png", "transactions"),
        purchasedItems: [
          { productId: basketball._id, qty: 3 },
          { productId: vanguard._id, qty: 2 },
        ],
      });
    } else {
      console.warn(
        "⚠️  Could not create transaction: required products missing.",
      );
    }

    console.log("✨ Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    // Always close connection
    await mongoose.disconnect();
    console.log("🔌 Database connection closed.");
    process.exit(0);
  }
}

seed();
