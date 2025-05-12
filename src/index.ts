import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import campaignRoutes from "./campaigns/campaign.routes";
import messageRoutes from "./messages/message.routes";
import linkedinRoutes from "./linkedin/linkedin.routes";

import { Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// routes
app.use("/linkedin", linkedinRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/personalized-message", messageRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
  });
