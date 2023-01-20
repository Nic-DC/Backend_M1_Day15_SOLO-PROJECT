import express, { Router } from "express";
import createHttpError from "http-errors";
import ProductsModel from "./model.js";

const porductsRouter = express.Router();

porductsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body); // here it happens validation (thanks to Mongoose) of req.body, if it is not ok Mongoose will throw an error
    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

porductsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find({}, { name: 1, brand: 1 });
    res.send(products);
  } catch (error) {
    next(error);
  }
});

porductsRouter.get("/:productId", async (req, res, next) => {
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

porductsRouter.put("/:productId", async (req, res, next) => {
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

porductsRouter.delete("/:productId", async (req, res, next) => {
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

export default porductsRouter;
