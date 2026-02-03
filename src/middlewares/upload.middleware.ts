import multer, { FileFilterCallback, StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const BASE_UPLOAD_DIR = "uploads";

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getStorage = (subfolder: string = ""): StorageEngine => {
  return multer.diskStorage({
    destination(_req, _file, callback) {
      const targetDir = path.join(BASE_UPLOAD_DIR, subfolder);
      ensureDir(targetDir);
      callback(null, targetDir);
    },
    filename(_req, file, callback) {
      const name = path
        .parse(file.originalname)
        .name.replace(/\s+/g, "-")
        .toLowerCase();
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${name}-${suffix}${path.extname(file.originalname)}`);
    },
  });
};

const STANDARD_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VECTOR_TYPES = ["image/svg+xml", "image/svg"];

const createFilter = (allowedMimes: string[]) => {
  return (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    const isAllowedMime = allowedMimes.includes(file.mimetype);

    const isSvgExtension =
      path.extname(file.originalname).toLowerCase() === ".svg";
    const isSvgMime =
      file.mimetype.includes("svg") || file.mimetype.includes("xml");

    if (isAllowedMime || (isSvgExtension && isSvgMime)) {
      callback(null, true);
    } else {
      callback(
        new Error(`File type ${file.mimetype} not supported.`) as any,
        false,
      );
    }
  };
};

export const upload = {
  products: multer({
    storage: getStorage("products"),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: createFilter(STANDARD_TYPES),
  }),

  categories: multer({
    storage: getStorage("categories"),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: createFilter([...STANDARD_TYPES, ...VECTOR_TYPES]),
  }),

  transactions: multer({
    storage: getStorage("transactions"),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: createFilter(STANDARD_TYPES),
  }),
};
