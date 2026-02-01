import { Request, Response } from "express";
import Product from "../models/product.model";
import fs from "fs";

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;

    if (req.file) {
      productData.imageUrl = req.file.path;
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
    const product = await Product.findById(req.params.id).populate("category");

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
  let oldImagePath: string | null = null;

  try {
    const productData = req.body;
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if (req.file) {
      oldImagePath = existingProduct.imageUrl;
      productData.imageUrl = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true },
    );

    if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Failed to delete old image:", err);
      });
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const imagePath = product.imageUrl;
    await Product.findByIdAndDelete(req.params.id);

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Failed to delete image at ${imagePath}:`, err);
        }
      });
    }

    res
      .status(200)
      .json({ message: "Product and associated image deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};
