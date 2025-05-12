import mongoose, { Schema } from "mongoose";

export interface IPerson {
  name: string | null;
  country: string | null;
  photoUrl: string | null;
  profileUrl: string | null;
}

export interface ILinkedInResult {
  url: string;
  count: number;
  people: IPerson[];
  createdAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    name: String,
    country: String,
    photoUrl: String,
    profileUrl: { type: String, index: true },
  },
  { _id: false }
);

const LinkedInResultSchema = new Schema<ILinkedInResult>(
  {
    url: { type: String, required: true },
    count: { type: Number, required: true },
    people: { type: [PersonSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ILinkedInResult>(
  "LinkedInResult",
  LinkedInResultSchema,
  "linkedin_results"
);
