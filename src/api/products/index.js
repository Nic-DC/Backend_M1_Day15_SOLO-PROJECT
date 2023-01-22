import express, { Router } from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";

import ProductsModel from "./model.js";
import { checkProductSchema, checkFilterSchema, triggerBadRequest } from "./validator.js";

const productsRouter = express.Router();

productsRouter.post("/", checkProductSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body); // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find({}, { name: 1, category: 1, price: 1 });
    res.send(products);
  } catch (error) {
    next(error);
  }
});

// FILTER by "category" & "price"
productsRouter.get("/filter", checkFilterSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const { category, price } = req.query;

    const products = await ProductsModel.find({ category, price }, { name: 1, category: 1, price: 1 });

    if (products.length > 0) {
      res.send(products);
    } else {
      next(
        createHttpError(
          404,
          `There are no products that match these 2 criteria: category='${category}' AND price='${price}'`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// PAGINATION
productsRouter.get("/pagination", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await ProductsModel.countDocuments(mongoQuery.criteria);

    const products = await ProductsModel.find(mongoQuery.criteria, mongoQuery.options.fields)
      .limit(mongoQuery.options.limit) // No matter the order of usage of these 3 options, Mongo will ALWAYS go with SORT, then SKIP, then LIMIT
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3010/products/pagination", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const Product = await ProductsModel.findById(req.params.productId);
    if (Product) {
      res.send(Product);
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.productId, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    );

    // ******************************************************** ALTERNATIVE METHOD **************************************************
    /*     const Product = await ProductsModel.findById(req.params.ProductId) // When you do a findById, findOne, etc,... you get back not a PLAIN JS OBJECT but you obtain a MONGOOSE DOCUMENT which is an object with some superpowers
      Product.firstName = "George"
      await Product.save()
      res.send(Product) */
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.productId);
    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
