import { Router } from "express";
import * as c from "../messages/message.controller";
import * as val from "./message.validator";
import validator from "../middlewares/validator";

const router = Router();

router.post("/", val.validateCreateMessage, validator, c.create);

export default router;
