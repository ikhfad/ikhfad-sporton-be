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
    if (!req.file) {
      res.status(400).json({ message: "Payment proof is required!" });
      return;
    }

    const transactionData = { ...req.body };
    transactionData.paymentProof = `transactions/${req.file.filename}`;

    if (typeof transactionData.purchasedItems === "string") {
      try {
        transactionData.purchasedItems = JSON.parse(
          transactionData.purchasedItems,
        );
      } catch (error) {
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error(
              "Error deleting payment proof after parse failure:",
              err,
            );
        });
        res
          .status(400)
          .json({ message: "Invalid JSON format for purchasedItems" });
        return;
      }
    }

    if (
      !Array.isArray(transactionData.purchasedItems) ||
      transactionData.purchasedItems.length === 0
    ) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Error deleting payment proof after validation failure:",
            err,
          );
      });
      res
        .status(400)
        .json({ message: "purchasedItems must be a non-empty array" });
      return;
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

    console.error("Error creating transaction:", error);
    res.status(500).json({
      message: "An unexpected error occurred while creating the transaction.",
    });
  }
};

export const getTransactions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("purchasedItems.productId");
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: "An unexpected error occurred while fetching transactions.",
    });
  }
};

export const getTransactionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Transaction ID format" });
      return;
    }

    const transaction = await Transaction.findById(id).populate(
      "purchasedItems.productId",
    );

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    res.status(500).json({
      message: "An unexpected error occurred while fetching the transaction.",
    });
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const allowedStatuses = ["paid", "rejected"];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        message: "Invalid status. Only 'paid' or 'rejected' are allowed!",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid Transaction ID format" });
      return;
    }

    const existingTransaction = await Transaction.findById(id);

    if (!existingTransaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const previousStatus = existingTransaction.status;

    if (status === "paid" && previousStatus !== "paid") {
      let missingCount = 0;
      let insufficientCount = 0;

      for (const item of existingTransaction.purchasedItems) {
        const product = await Product.findById(item.productId);

        if (!product) {
          missingCount++;
          continue;
        }

        if (product.stock < item.qty) {
          insufficientCount++;
        }
      }

      if (missingCount > 0 || insufficientCount > 0) {
        const errors: string[] = [];

        if (missingCount > 0) {
          errors.push(`${missingCount} product(s) not found`);
        }

        if (insufficientCount > 0) {
          errors.push(`${insufficientCount} item(s) have insufficient stock`);
        }

        res.status(400).json({ message: errors.join(" and ") });
        return;
      }

      for (const item of existingTransaction.purchasedItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty },
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
    console.error("Error updating transaction status:", error);
    res.status(500).json({
      message: "An unexpected error occurred while updating the transaction.",
    });
  }
};
