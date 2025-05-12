import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  softDeleteCampaign,
} from "./campaign.service";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getCampaigns();
  res.json(data);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCampaignById(req.params.id);
  res.json(data);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await createCampaign(req.body);
  res.status(201).json(data);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateCampaign(req.params.id, req.body);
  res.json(data);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await softDeleteCampaign(req.params.id);
  res.status(204).send();
});
