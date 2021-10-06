const router = require("express").Router();
const Joi = require("@hapi/joi");
const { ObjectId } = require("bson");
const verify = require("../controlers/verifyToken");
const Categorise = require("../models/Categories");

const CategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
});

//crate new item
router.post("/add-new", verify, async (req, res) => {
  // validate
  const { error } = CategorySchema.validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  // trim space and lower case
  const resName = req.body.name.toLowerCase().trim();

  //checking item is exist
  isExist = await Categorise.findOne({ name: resName });
  if (isExist) {
    res.status(400).send("item is exist");
    return;
  }

  const categoryItem = new Categorise({ name: resName });

  try {
    await categoryItem.save(categoryItem);

    res.send(categoryItem);
  } catch (error) {
    res.status(400).send(error);
  }
});

// get item list
router.get("/get-categorise", verify, async (req, res) => {
  const list = await Categorise.find();
  const count = list.length;

  if (!count) res.status(400).send("Categorise haven't any item");

  try {
    res.send({
      total: count,
      Categorise: list,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete item
router.delete("/delete", verify, async (req, res) => {
  const itemId = req.query.id;
  if (!itemId) res.status(400).send("item id is required");

  const status = await Categorise.findByIdAndDelete({ _id: ObjectId(itemId) });
  if(!status) res.status(400).send("Have not thing to delete")

  try {
    res.send("Delete item sucessfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
