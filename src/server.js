import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import productsRouter from "./api/products/index.js";
// import blogPostsRouter from "./api/blogPosts/index.js";
// import authorsRouter from "./api/authors/index.js";
// import usersRouter from "./api/users/index.js";
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js";

const server = express();
const port = process.env.PORT || 3010;

// ******************************* MIDDLEWARES ****************************************
server.use(cors());
server.use(express.json());

// ******************************** ENDPOINTS *****************************************
server.use("/products", productsRouter);
// server.use("/authors", authorsRouter);
// server.use("/users", usersRouter);

// ***************************** ERROR HANDLERS ***************************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  console.log(process.env.MONGO_URL);
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port no: ${port}`);
  });
});