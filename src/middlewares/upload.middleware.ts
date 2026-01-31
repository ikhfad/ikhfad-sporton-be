import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDir);
  },
  filename(_req, file, callback) {
    const originalName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "-")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(
      null,
      `${originalName}-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

const STANDARD_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VECTOR_TYPES = ["image/svg+xml"];

const createFilter = (allowedMimes: string[]) => {
  return (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(`Invalid format. Allowed: ${allowedMimes.join(", ")}`) as any,
        false,
      );
    }
  };
};

export const upload = {
  standard: multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: createFilter(STANDARD_TYPES),
  }),

  extended: multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: createFilter([...STANDARD_TYPES, ...VECTOR_TYPES]),
  }),

  vector: multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: createFilter(VECTOR_TYPES),
  }),
};
