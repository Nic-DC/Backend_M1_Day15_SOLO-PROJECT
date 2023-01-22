import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import productsRouter from "./api/products/index.js";
import reviewsRouter from "./api/reviews/index.js";
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js";

const { PORT } = process.env;

const server = express();
// const port = process.env.PORT || 3010;

// ******************************* MIDDLEWARES ****************************************
server.use(cors());
server.use(express.json());

// ******************************** ENDPOINTS *****************************************
server.use("/products", productsRouter);
server.use("/reviews", reviewsRouter);
// server.use("/users", usersRouter);

// ***************************** ERROR HANDLERS ***************************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(PORT, () => {
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on port: ${PORT} & connected to db`);
  });
});

server.on("error", (error) => console.log(`❌ Server is not running due to : ${error}`));

// OR
/*
server.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.table(listEndpoints(server));
    console.log(`✅ Server is running on ${PORT} and connected to db`);
  } catch (error) {
    console.log("Db connection is failed ", error);
  }
});
*/
