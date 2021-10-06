const router = require("express").Router();
const Joi = require("@hapi/joi");
const { ObjectId } = require("bson");
const Products = require("../models/Products");
const verify = require("../controlers/verifyToken");
const upload = require("../controlers/upload");

const productSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  subTitle: Joi.string().min(10).max(100).required(),
  desc: Joi.string().min(10).max(1000).required(),
  categorise: Joi.string().min(3).required(),
  price: Joi.number().min(1000).required(),
  salesPrice: Joi.number().min(1000),
});

//create new item
router.post(
  "/add-new",
  upload.single("thumbnail"),
  verify,
  async (req, res) => {
    // validate
    const { error } = productSchema.validate(req.body);
    if (error) res.status(400).send(error.details[0].message);

    //check exist
    const isExist = await Products.findOne({ name: req.body.name.trim() });
    if (isExist) {
      res.status(400).send("Item is already exist");
      return;
    }

    const image = req.file;
    if (!image) res.status(400).send("Choose one image");

    const categoriseArr = req.body.categorise.split(",");

    const fullUrl = req.protocol + "://" + req.get("host");

    const product = new Products({
      name: req.body.name,
      subTitle: req.body.subTitle,
      thumbNail: `${fullUrl}/${image.path}`,
      description: req.body.desc,
      categorise: categoriseArr,
      price: req.body.price,
      salePrice: req.body.salesPrice,
    });

    try {
      await product.save(product);
      res.send(product);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

//get all item
router.get("/get-item", verify, async (req, res) => {
  const { limit, page } = req.query;

  try {
    const total = await Products.count();
    const product = await Products.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.send({
      total: total,
      data: product,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

//get item by id
router.get("/get-by", verify, async (req, res) => {
  const { itemId } = req.query;
  if (!itemId) res.status(400).send("item id is required");

  const item = await Products.findOne({
    _id: ObjectId(itemId.trim()),
  });

  if (!item) res.status(400).send("Can not found item");

  try {
    res.send(item);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete item
router.delete("/delete", verify, async (req, res) => {
  const { itemId } = req.query;
  if (!itemId) res.status(400).send("item id is required");

  const product = await Products.findByIdAndDelete({
    _id: ObjectId(itemId),
  });

  if (!product) res.status(400).send("Have not thing to delete");

  try {
    res.send("Delete item sucessfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

//update item
router.put("/update", upload.single("thumbnail"), verify, async (req, res) => {
  const { itemId, name, subTitle, description, categorise, price, salePrice } =
    req.body;
  const image = req.file;
  const fullUrl = req.protocol + "://" + req.get("host");
  const checkParams = Object.keys(req.body);
  const key = {
    name: name,
    subTitle: subTitle,
    description: description,
    categorise: categorise.split(","),
    price: price,
    salePrice: salePrice,
  };

  // res.send(checkParams);
  if (!itemId) {
    res.status(400).send("item id is required");
    return;
  }

  if (checkParams.length <= 0) {
    res.status(400).send("Have nothing to update");
    return;
  }

  try {
    const product = await Products.findOne({ _id: ObjectId(itemId) });
    if (!product) {
      res.status(400).send("cannot found item");
      return;
    }

    checkParams.forEach((item) => {
      product.set({
        ...product,
        [item]: key[item],
      });
    });

    if (image) {
      product.set({
        ...product,
        thumbNail: `${fullUrl}/${image.path}`,
      });
    }

    await product.save(product);

    res.send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
