import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  leads: string[];
  accountIDs: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "INACTIVE",
    },
    leads: { type: [String], default: [] },
    accountIDs: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>("Campaign", CampaignSchema);
