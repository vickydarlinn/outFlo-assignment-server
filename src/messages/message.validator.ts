import { body } from "express-validator";

export const validateCreateMessage = [
  body("name").isString().trim().notEmpty().withMessage("name is required"),
  body("job_title")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("job_title is required"),
  body("company")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("company is required"),
  body("location")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("location is required"),
  body("summary").optional().isString(),
];
