import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.APP_PORT || "5000";
const MONGO_URI = process.env.APP_MONGO_URI || "no-mongo-uri";

mongoose
  .connect(MONGO_URI, {
    family: 4, // Force IPv4 (avoids IPv6 handshake issues)
    authSource: "admin", // Explicitly tell it where to look for the user
    retryWrites: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));
