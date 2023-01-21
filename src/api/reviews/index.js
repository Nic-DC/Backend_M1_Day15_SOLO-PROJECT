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
    const { productId } = req.params;
    const { reviewId } = req.params;

    const isProduct = await ProductsModel.findOne({ _id: productId });

    if (isProduct) {
      const review = isProduct.reviews.find((review) => review._id.toString() === reviewId);
      if (review) {
        res.send(review);
      } else {
        next(NotFound(`Review with id ${reviewId} not found!`));
      }
    } else {
      next(NotFound(`The product with id: ${productId} is not in our archive`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.put("/:productId/:reviewId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { reviewId } = req.params;

    const isProduct = await ProductsModel.findById(productId);

    if (isProduct) {
      const index = isProduct.reviews.findIndex((review) => review._id.toString() === reviewId);
      console.log("index: ", index);
      if (index !== -1) {
        const oldReview = isProduct.reviews[index];
        console.log("old review: ", ...oldReview.toObject());
        const updatedReview = { ...oldReview, ...req.body, updatedAt: new Date() };
        console.log("updated review: ", updatedReview);
        isProduct.reviews[index] = updatedReview;

        await isProduct.save();

        res.send({
          message: `Review with id: ${reviewId} from product: '${isProduct.name}' successfully updated and you can see it below`,
          updatedReview: updatedReview,
        });
      } else {
        next(NotFound(`Review with id ${reviewId} not found!`));
      }
    } else {
      next(NotFound(`The product with id: ${productId} is not in our archive`));
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
