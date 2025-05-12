import { RequestHandler, Router } from "express";
import * as c from "./linkedin.controller";
import validator from "../middlewares/validator";
import { searchValidator } from "./linkedin.validator";

const router = Router();

router.post(
  "/search",
  searchValidator,
  validator,
  c.searchPeople as unknown as RequestHandler
);
router.get("/latest", c.getLatestResults as unknown as RequestHandler);

export default router;
