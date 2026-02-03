import mongoose, { Schema, Document } from "mongoose";

export interface IBank extends Document {
  bankName: string;
  accountName: string;
  accountNumber: number;
}

const BankSchema: Schema = new Schema(
  {
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: Number, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IBank>("Bank", BankSchema);
