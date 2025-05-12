import { body } from "express-validator";

export const searchValidator = [
  body("url")
    .exists({ checkFalsy: true })
    .withMessage('"url" is required')
    .bail()
    .isString()
    .matches(/^https:\/\/www\.linkedin\.com\/search\/results\/people\//)
    .withMessage(
      'url must start with "https://www.linkedin.com/search/results/people/"'
    ),

  body("count")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("count must be an integer between 1 and 50"),
];
