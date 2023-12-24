const { default: slugify } = require("slugify");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Get all product with filter sorting and pagination
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    //Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);

    // Correct the regular expression and the replacement string
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = Product.find(JSON.parse(queryString));

    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort?.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //Limiting The fields

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    let skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const allProduct = await query;
    res.json({
      data: allProduct,
      total: await Product.countDocuments(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get product by id
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id; // Extract the id from req.params
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const productUpdate = await Product.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
      }
    );
    res.json(productUpdate);
  } catch (error) {
    throw new Error(error);
  }
});

// DElete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id; // Extract the id from req.params
  try {
    const productDeleted = await Product.findOneAndDelete({ _id: id });
    res.json(productDeleted);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
};
