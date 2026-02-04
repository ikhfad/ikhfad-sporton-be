import { Request, Response } from "express";
import Transaction from "../models/transaction.model";
import Product from "../models/product.model";
import fs from "fs";
import mongoose from "mongoose";

export const createTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactionData = { ...req.body };

    if (req.file) {
      transactionData.paymentProof = `/transactions/${req.file.filename}`;
    } else {
      res.status(400).json({ message: "Payment proof is required!" });
      return;
    }

    if (typeof transactionData.purchasedItems === "string") {
      try {
        transactionData.purchasedItems = JSON.parse(
          transactionData.purchasedItems,
        );
      } catch (error) {
        res.status(400).json({ message: "Invalid format for purchasedItems" });
      }
    }

    transactionData.status = "pending";

    const transaction = new Transaction(transactionData);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error("Error deleting payment proof after DB failure:", err);
      });
    }
    res.status(500).json({ message: "Error creating transaction", error });
  }
};

export const getTransactions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transaction = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("purchasedItems.productId");
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction", error });
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const transaction = await Transaction.findById(id).populate(
      "purchasedItems.productId",
    );

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Transaction ID format" });
      return;
    }

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction", error });
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const transactionData = status;
    const existingTransaction = await Transaction.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Transaction ID format" });
      return;
    }

    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    if (status === "paid" && existingTransaction.status !== "paid") {
      for (const item of existingTransaction.purchasedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $increment: { stock: -item.qty },
        });
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating transaction status", error });
  }
};
