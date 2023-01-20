import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const { BadRequest } = createHttpError;

const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: `comment is a mandatory field and needs to be a string`,
    },
  },
  rate: {
    in: ["body"],
    isDecimal: {
      errorMessage: `rate is a mandatory field and needs to max. 5`,
    },
  },
};

export const checkReviewSchema = checkSchema(reviewSchema);

export const triggerBadRequest = (req, res, next) => {
  const errorList = validationResult(req);

  if (!errorList.isEmpty()) {
    next(
      BadRequest({
        message: "Error during post validation",
        errors: errorList.array(),
      })
    );
  } else {
    next();
  }
};
