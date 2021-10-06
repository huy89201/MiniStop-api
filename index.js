const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

//port
const port = 3000;

// dotenv config
dotenv.config();

// DB connected
mongoose.connect(process.env.DB_CONNECT, () =>
  console.log("connected to MongoDB")
);

// middlewares
app.use(express.json());

// router
const authRoute = require("./routers/auth");
const categoryRoute = require("./routers/categories");
const productRoute = require("./routers/products");

// route middlewares
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use("/api/user", authRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
