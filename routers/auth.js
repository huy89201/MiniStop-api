const router = require("express").Router();
const User = require("../models/User");
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../controlers/verifyToken");
const { ObjectId } = require("bson");

//register schema
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().min(6).max(50).required().email(),
  password: Joi.string().min(6).max(16).required(),
});

//login schema
const loginSchema = Joi.object({
  email: Joi.string().min(6).max(50).required().email(),
  password: Joi.string().min(6).max(16).required(),
});

router.post("/register", async (req, res) => {
  //validate req
  const { error } = registerSchema.validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  // check user exist
  const isExist = await User.findOne({ email: req.body.email });
  if (isExist) {
    res.status(400).send("User already exists"); 
    return;
  }

  //hash password
  const salt = await bcrypt.genSalt();
  const hashPass = await bcrypt.hash(req.body.password, salt);

  //add new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPass,
  });

  try {
    await user.save(user);

    res.send("Register succed");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  //validate req
  const { error } = loginSchema.validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  //check email & password
  const user = await User.findOne({ email: req.body.email });
  if (!user) res.status(400).send("User is not exist");

  const isValidPass = await bcrypt.compare(req.body.password, user.password);

  if (!isValidPass) res.status(400).send("Password is wrong");

  //create and sign token
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);

  res.header("auth-token", token).send({
    userID: user._id,
    token: token,
  });
});

router.get("/user-data", verify, async (req, res) => {
  const user = await User.findOne({ _id: ObjectId(req.query.userid) });
  if (!user) res.status(400).send("User is not exist");

  try {
    res.send({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
