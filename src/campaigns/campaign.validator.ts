import { body, param } from "express-validator";

/**
 * Validate :id route parameter for MongoDB ObjectId
 */
export const validateCampaignId = [
  param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId"),
];

/**
 * POST /campaigns  – create a new campaign
 */
export const validateCreateCampaign = [
  // name
  body("name").isString().trim().notEmpty().withMessage("name is required"),

  // description
  body("description")
    .isString()
    .notEmpty()
    .withMessage("description cannot be empty"),

  // status (optional)
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("status must be either 'ACTIVE' or 'INACTIVE'"),

  // leads (array of valid URLs, at least one)
  body("leads")
    .isArray({ min: 1 })
    .withMessage("campaign needs at least one LinkedIn URL"),
  body("leads.*").isURL().withMessage("Each lead must be a valid URL"),

  // accountIDs (array of strings, at least one)
  body("accountIDs")
    .isArray({ min: 1 })
    .withMessage("campaign needs at least one account ID"),
  body("accountIDs.*")
    .isString()
    .withMessage("Each account ID must be a string"),
];

/**
 * PUT /campaigns/:id  – partial update
 */
export const validateUpdateCampaign = [
  // name (optional)
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("name cannot be empty"),

  // description (optional)
  body("description").optional().isString(),

  // status (optional – allows DELETED)
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "DELETED"])
    .withMessage("status must be one of 'ACTIVE', 'INACTIVE', 'DELETED'"),

  // leads (optional)
  body("leads")
    .optional()
    .isArray({ min: 1 })
    .withMessage("leads must be an array with at least one URL"),
  body("leads.*")
    .optional()
    .isURL()
    .withMessage("Each lead must be a valid URL"),

  // accountIDs (optional)
  body("accountIDs")
    .optional()
    .isArray({ min: 1 })
    .withMessage("accountIDs must be an array with at least one ID"),
  body("accountIDs.*")
    .optional()
    .isString()
    .withMessage("Each account ID must be a string"),
];
