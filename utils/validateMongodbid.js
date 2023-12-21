const mongoose = require("mongoose");

const validateMongoDBID = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("Id is not valid or not found");
};

module.exports = validateMongoDBID;
