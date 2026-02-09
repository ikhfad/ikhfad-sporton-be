import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.APP_JWT_SECRET || "there-is-no-secret";
const APP_PORT = parseInt(process.env.APP_PORT || "5000", 10);
const MONGO_URI = process.env.APP_MONGO_URI || "no-mongo-uri";

interface Config {
  JWT_SECRET: string;
  APP_PORT: number;
  APP_MONGO_URI: string;
}

const validateEnv = (): Config => {
  const errors: string[] = [];

  if (!JWT_SECRET) {
    errors.push("❌ APP_JWT_SECRET is required but not set!");
    errors.push("   Please add APP_JWT_SECRET to your .env file");
    errors.push("   Example: APP_JWT_SECRET=your-super-secret-key-here");
    errors.push("   Generate a secure secret: openssl rand -hex 64");
  } else if (JWT_SECRET === "there-is-no-secret") {
    errors.push("❌ APP_JWT_SECRET is set to default insecure value!");
    errors.push("   Please generate a new secure secret");
    errors.push("   Run: openssl rand -hex 64");
  } else if (JWT_SECRET.length < 128) {
    errors.push(
      "⚠️  APP_JWT_SECRET should be at least 128 characters for HS512 (64 bytes)",
    );
    errors.push("   Current length: " + JWT_SECRET.length);
    errors.push("   Generate one with: openssl rand -hex 64");
  }

  if (!MONGO_URI) {
    errors.push("❌ APP_MONGO_URI is required but not set!");
    errors.push("   Please add APP_MONGO_URI to your .env file");
    errors.push(
      "   Example: APP_MONGO_URI=mongodb://localhost:27017/sportondb",
    );
    errors.push(
      "   Or for Atlas: APP_MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sportondb",
    );
  } else if (
    MONGO_URI === "no-mongo-uri" ||
    MONGO_URI.includes("your-mongo-uri") ||
    MONGO_URI.includes("<")
  ) {
    errors.push("❌ APP_MONGO_URI appears to be a placeholder value!");
    errors.push("   Please set a valid MongoDB connection string");
  } else {
    const mongoPattern = /^mongodb(\+srv)?:\/\//;
    if (!mongoPattern.test(MONGO_URI)) {
      errors.push(
        "⚠️  APP_MONGO_URI doesn't match expected MongoDB format (should start with mongodb:// or mongodb+srv://)",
      );
    }
  }

  if (errors.length > 0) {
    console.error("🚫 Environment Validation Failed");
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
  console.log(
    `   JWT Secret: ${"*".repeat(JWT_SECRET!.length)} (${JWT_SECRET!.length} chars)`,
  );
  console.log(`   MongoDB: Connected to valid URI`);

  return {
    JWT_SECRET: JWT_SECRET!,
    APP_PORT,
    APP_MONGO_URI: MONGO_URI!,
  };
};

const config = validateEnv();

export default config;
