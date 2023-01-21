import express from "express";
import createHttpError from "http-errors";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";
import { checkReviewSchema, triggerBadRequest } from "./validator.js";

const { NotFound, BadRequest } = createHttpError;

const reviewsRouter = express.Router();

reviewsRouter.post("/:productId", checkReviewSchema, triggerBadRequest, async (req, res, next) => {
  try {
    const { productId } = req.params;

    // const isProduct = await ProductsModel.findByIdAndUpdate(
    //   productId,
    //   { $push: { reviews: { ...req.body } } },
    //   { new: true, runValidators: true }
    // );
    // console.log("isProduct", isProduct);
    // if (isProduct) {
    //   res.status(201).send(isProduct);
    // } else {
    //   console.log("hiiioiasd");
    //   next(NotFound(`No product `));
    // }
    const isProduct = await ProductsModel.findById(productId);

    if (isProduct) {
      const newReview = new ReviewsModel(req.body);
      isProduct.reviews.push(newReview);
      await newReview.save();
      await isProduct.save();
      res.send({ product: isProduct.name, reviews: isProduct.reviews });

      //     const { _id } = await newReview.save();
      // res.status(201).send({ _id });
    } else {
      next(NotFound(`No product with id: ${productId} in our archive`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/", async (req, res, next) => {
  try {
    const { productId } = req.params;

    const isProduct = await ProductsModel.findOne({ _id: productId });

    if (isProduct) {
      res.send(isProduct.reviews);
    } else {
      next(NotFound(`No product with id: ${productId} in our archive`));
    }
    // const reviews = await ReviewsModel.find({}, { comment: 1, rate: 1 });
    // res.send(reviews);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/:reviewId", async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await ReviewsModel.findById(req.params.reviewId);
    if (review) {
      res.send(review);
    } else {
      next(NotFound(`Review with id ${req.params.reviewId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.put("/:reviewId", async (req, res, next) => {
  try {
    const updatedReview = await ReviewsModel.findByIdAndUpdate(
      req.params.reviewId, // WHO you want to modify
      req.body, // HOW you want to modify
      { new: true, runValidators: true } // OPTIONS. By default findByIdAndUpdate returns the record PRE-MODIFICATION. If you want to get back the updated object --> new:true
      // By default validation is off here --> runValidators: true
    );

    // ******************************************************** ALTERNATIVE METHOD **************************************************
    /*     const Product = await ProductsModel.findById(req.params.ProductId) // When you do a findById, findOne, etc,... you get back not a PLAIN JS OBJECT but you obtain a MONGOOSE DOCUMENT which is an object with some superpowers
        Product.firstName = "George"
        await Product.save()
        res.send(Product) */

    if (updatedReview) {
      res.send(updatedReview);
    } else {
      next(NotFound(`Review with id ${req.params.reviewId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete("/:reviewId", async (req, res, next) => {
  try {
    const deletedReview = await ReviewsModel.findByIdAndDelete(req.params.reviewId);
    if (deletedReview) {
      res.send({ message: `Review with id ${req.params.reviewId} successfully deleted` });
    } else {
      next(NotFound(`Review with id ${req.params.reviewId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default reviewsRouter;
