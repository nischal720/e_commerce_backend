const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { notFounnd, errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

//User API
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);

app.use(notFounnd);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
