import Campaign from "./campaign.model";
import createHttpError from "http-errors";
import { CreateCampaign, UpdateCampaign } from "./campaign.types";

export async function createCampaign(data: CreateCampaign) {
  return Campaign.create(data);
}

export async function getCampaigns() {
  return Campaign.find({ status: { $ne: "DELETED" } });
}

export async function getCampaignById(id: string) {
  const campaign = await Campaign.findById(id);
  if (!campaign || campaign.status === "DELETED")
    throw createHttpError(404, "Campaign not found");
  return campaign;
}

export async function updateCampaign(id: string, data: UpdateCampaign) {
  const campaign = await Campaign.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!campaign) throw createHttpError(404, "Campaign not found");
  return campaign;
}

export async function softDeleteCampaign(id: string) {
  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { status: "DELETED" },
    { new: true }
  );
  if (!campaign) throw createHttpError(404, "Campaign not found");
  return campaign;
}
