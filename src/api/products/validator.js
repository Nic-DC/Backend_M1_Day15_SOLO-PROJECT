import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const productSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "name is a mandatory field and needs to be a string!",
    },
  },
  description: {
    in: ["body"],
    isString: {
      errorMessage: "description is a mandatory field and needs to be a string",
    },
  },
  brand: {
    in: ["body"],
    isString: {
      errorMessage: "brand is a mandatory field and needs to be a string!",
    },
  },
  imageUrl: {
    in: ["body"],
    isString: {
      errorMessage: "url is a mandatory field and needs to be a string!",
    },
  },
  price: {
    in: ["body"],
    isDecimal: {
      errorMessage: "price is a mandatory field and needs to be a number!",
    },
  },
};

const filterSchema = {
  category: {
    in: ["query"],
    isString: {
      errorMessage: "category must be in query and type must be string to search!",
    },
  },
  price: {
    in: ["query"],
    isNumeric: {
      errorMessage: "price must be in query and type must be a number to search!",
    },
  },
};

export const checkProductSchema = checkSchema(productSchema);
export const checkFilterSchema = checkSchema(filterSchema);

export const triggerBadRequest = (req, res, next) => {
  const errorList = validationResult(req);

  if (!errorList.isEmpty()) {
    next(createHttpError(400, "Error during post validation", { errors: errorList.array() }));
    // next(createHttpError(400, "Error during post validation"));
  } else {
    next();
  }
};
