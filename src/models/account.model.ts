import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  name: string;
}

const AccountSchema = new Schema<IAccount>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", AccountSchema);
