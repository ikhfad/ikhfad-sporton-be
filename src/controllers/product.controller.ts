import { Request, Response } from "express";
import Product from "../models/product.model";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;

    if (req.file) {
      productData.imageUrl = `/products/${req.file.filename}`;
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after DB failure:", err);
      });
    }
    res.status(500).json({ message: "Error creating product" });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await Product.findById(id).populate("category");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(400).json({ message: "Invalid Product ID format" });
      return;
    }

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let oldImageRelativePath: string | null = null;

  try {
    const id = req.params.id as string;
    const productData = req.body;

    const existingProduct = await Product.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(400).json({ message: "Invalid Product ID format" });
      return;
    }

    if (!existingProduct) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (req.file) {
      oldImageRelativePath = existingProduct.imageUrl;
      productData.imageUrl = `/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (req.file && oldImageRelativePath) {
      const fileName = path.basename(oldImageRelativePath);
      const oldPhysicalPath = path.join(
        process.cwd(),
        "uploads",
        "products",
        fileName,
      );
      if (fs.existsSync(oldPhysicalPath)) {
        fs.unlink(oldPhysicalPath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: "Error updating product", error });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await Product.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Category ID format" });
      return;
    }

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const imageRelativePath = product.imageUrl;
    await Product.findByIdAndDelete(id);

    if (imageRelativePath) {
      const fileName = path.basename(imageRelativePath);

      const physicalPath = path.join(
        process.cwd(),
        "uploads",
        "products",
        fileName,
      );

      if (fs.existsSync(physicalPath)) {
        fs.unlink(physicalPath, (err) => {
          if (err) {
            console.error(`Failed to delete image at ${physicalPath}:`, err);
          }
        });
      } else {
        console.log("File not found on disk, skipped deletion: ", physicalPath);
      }
    }

    res
      .status(200)
      .json({ message: "Product and associated image deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};
