import { RequestHandler } from "express";

export default (fn: RequestHandler): RequestHandler =>
  function asyncWrap(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log("i came from asyncWrap");
      return next(err);
    });
  };
