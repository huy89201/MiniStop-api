const { ObjectID } = require("bson");
const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50,
  },
  subTitle: {
    type: String,
    required: true,
    max: 300,
  },
  thumbNail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    max: 1000,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
  },
  categorise: {
    type: [String],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
