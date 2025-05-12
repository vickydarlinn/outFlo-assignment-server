import { Router } from "express";
import * as c from "../controllers/message.controller";
import * as val from "../validators/message.validator";
import validator from "../middlewares/validator";

const router = Router();

router.post("/", val.validateCreateMessage, validator, c.create);

export default router;
