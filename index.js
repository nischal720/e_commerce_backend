const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { notFounnd, errorHandler } = require("./middlewares/errorHandler");
dbConnect();
app.use(bodyParser.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
//User API
app.use("/api/user", authRouter);

app.use(notFounnd);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
