import { NextFunction, Request, Response } from "express";
import linkedinService from "./linkedin.service";
import createHttpError from "http-errors";
import asyncHandler from "../middlewares/asyncHandler";
import linkedinResultModel from "./linkedinResult.model";

let busy = false;

export const searchPeople = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (busy) {
    return createHttpError(
      429,
      "Another LinkedIn search is running. Try again in a moment."
    );
  }

  busy = true; // lock
  try {
    const { url, count = 10 } = req.body;
    const people = await linkedinService.search(url, Number(count));
    const doc = await linkedinResultModel.create({
      url,
      count: Number(count),
      people,
    });

    res.json({ _id: doc._id, people });
  } catch (err) {
    return next(err);
  } finally {
    busy = false;
  }
};

export const getLatestResults = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(
      parseInt((req.query.limit as string) || "1", 10),
      50
    ); // cap at 50 just in case

    const docs = await linkedinResultModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(docs);
  }
);
