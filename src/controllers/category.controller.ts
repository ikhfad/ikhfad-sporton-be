import { Request, Response } from "express";
import Category from "../models/category.model";
import fs from "fs";

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryData = req.body;
    if (req.file) {
      categoryData.imageUrl = req.file.path;
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
  req: Request,
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
  let oldImagePath: string | null = null;

  try {
    const categoryData = req.body;
    const existingCategory = await Category.findById(req.params.id);

    if (!existingCategory) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if (req.file) {
      oldImagePath = existingCategory.imageUrl;
      categoryData.imageUrl = req.file.path;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      categoryData,
      { new: true },
    );

    if (req.file && oldImagePath && fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Failed to delete old image:", err);
      });
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
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const imagePath = category.imageUrl;
    await Category.findByIdAndDelete(req.params.id);

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Failed to delete image at ${imagePath}:`, err);
        }
      });
    }

    res
      .status(200)
      .json({ message: "Category and associated image deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ message: "Error deleting category", error });
  }
};
