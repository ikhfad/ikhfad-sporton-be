import { Request, Response } from "express";
import Category from "../models/category.model";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = { ...req.body };

    if (req.file) {
      categoryData.imageUrl = `/categories/${req.file.filename}`;
    }

    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after DB failure:", err);
      });
    }
    res.status(500).json({ message: "Error creating category", error });
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  let oldImageRelativePath: string | null = null;

  try {
    const id = req.params.id as string;
    const categoryData = { ...req.body };
    const existingCategory = await Category.findById(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(400).json({ message: "Invalid Category ID format" });
      return;
    }

    if (!existingCategory) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if (req.file) {
      oldImageRelativePath = existingCategory.imageUrl;
      categoryData.imageUrl = `/categories/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true },
    );

    if (req.file && oldImageRelativePath) {
      const fileName = path.basename(oldImageRelativePath);
      const oldPhysicalPath = path.join(
        process.cwd(),
        "uploads",
        "categories",
        fileName,
      );
      if (fs.existsSync(oldPhysicalPath)) {
        fs.unlink(oldPhysicalPath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
        });
      }
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: "Error updating category", error });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await Category.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Category ID format" });
      return;
    }

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const imageRelativePath = category.imageUrl;
    await Category.findByIdAndDelete(id);

    if (imageRelativePath) {
      const fileName = path.basename(imageRelativePath);

      const physicalPath = path.join(
        process.cwd(),
        "uploads",
        "categories",
        fileName,
      );

      if (fs.existsSync(physicalPath)) {
        fs.unlink(physicalPath, (err) => {
          if (err) {
            console.error(`Failed to delete image at ${physicalPath}:`, err);
          }
        });
      } else {
        console.log(
          "File not found on disk, skipped deletion: ",
          physicalPath,
        );
      }
    }

    res
      .status(200)
      .json({ message: "Category and associated image deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Error deleting category", error });
  }
};
