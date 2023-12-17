//not found
const notFounnd = (req, res, next) => {
  const error = new Error(`Not Found : ${req.original}`);
  res.status(404);
  next(error);
};

//Error handler

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err?.message,
    stack: err?.stack,
  });
};

module.exports = { notFounnd, errorHandler };
