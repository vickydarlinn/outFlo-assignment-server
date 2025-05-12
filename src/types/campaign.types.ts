export type CreateCampaign = {
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "DELETED";
  leads?: string[];
  accountIDs?: string[];
};

export type UpdateCampaign = Partial<CreateCampaign>;
