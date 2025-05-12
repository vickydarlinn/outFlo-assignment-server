import { RequestHandler, Router } from "express";
import * as c from "../controllers/campaign.controller";
import * as val from "../validators/campaign.validator";
import validator from "../middlewares/validator";

const router = Router();

router.get("/", c.getAll);

router.get(
  "/:id",
  val.validateCampaignId,
  validator,
  c.getOne as unknown as RequestHandler
);

router.post("/", val.validateCreateCampaign, validator, c.create);

router.put("/:id", val.validateUpdateCampaign, validator, c.update);

router.delete("/:id", val.validateCampaignId, validator, c.remove);

export default router;
