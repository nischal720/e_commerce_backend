const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/productController");
const { isAdmin, authMiddleWare } = require("../middlewares/authMiddleware");

const route = express.Router();

//Post and update
route.post("/", authMiddleWare, isAdmin, createProduct);
route.put("/:id", authMiddleWare, isAdmin, updateProduct);

//Get Routes
route.get("/", getAllProduct);
route.get("/:id", authMiddleWare, isAdmin, getProduct);

//Delete
route.delete("/:id", authMiddleWare, isAdmin, deleteProduct);
module.exports = route;
