import { Request, Response } from "express";
import Bank from "../models/bank.model";

export const createBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bankName, accountName, accountNumber } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const bank = new Bank({
      bankName,
      accountName,
      accountNumber: Number(accountNumber),
    });

    await bank.save();
    res.status(201).json(bank);
  } catch (error) {
    res.status(500).json({ message: "Error creating bank", error });
  }
};

export const getBanks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bank = await Bank.find().sort({ createdAt: -1 });
    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bank", error });
  }
};

export const getBankById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bank", error });
  }
};

export const updateBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bankData = req.body;
    const existingBank = await Bank.findById(req.params.id);

    if (!existingBank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    const updatedBank = await Bank.findByIdAndUpdate(req.params.id, bankData, {
      new: true,
    });

    res.status(200).json(updatedBank);
  } catch (error) {
    res.status(500).json({ message: "Error updating bank", error });
  }
};

export const deleteBank = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bank = await Bank.findById(req.params.id);

    if (!bank) {
      res.status(404).json({ message: "Bank not found" });
      return;
    }

    await Bank.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error) {
    console.error("Delete Bank Error:", error);
    res.status(500).json({ message: "Error deleting bank", error });
  }
};
