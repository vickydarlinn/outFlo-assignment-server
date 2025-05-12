import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { generateMessage } from "./message.service";
import createHttpError from "http-errors";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const message = await generateMessage(req.body);
  if (!message) throw createHttpError(500, "Failed to generate message");
  res.json({ message });
});
