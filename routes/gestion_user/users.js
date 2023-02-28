/* eslint-disable complexity */
var express = require("express");
var router = express.Router();
var User = require("../../models/gestion_user/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const {auth, generateToken} = require("../../middleware/auth");
const { body,validationResult } = require("express-validator");
const { userpermission, authorize } = require("../../middleware/userpermission");


router.get("/", authorize("VIEW_USER_MODULE"),async (req, res)=> {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//sign up user
router.post("/signup",[ 
  body("username").notEmpty(),
  body("first_name").notEmpty(),
  body("last_name").notEmpty(),
  body("age").isInt({ min: 1 }),
  body("email").isEmail(),
  body("password").isLength({ min: 4 }),
],async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, first_name, last_name, age, email, password, permissions } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      first_name,
      last_name,
      age,
      email,
      password: hashedPassword,
      permissions
    });
    await user.save();

    res.status(201).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// eslint-disable-next-line complexity
router.post("/login",[ body("email").isEmail(), body("password").notEmpty(),], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid login credentials");

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Authentication failed" });
  }
});
router.post("/add",authorize(userpermission.USER_MODULE_CRUDS),[
  body("username").notEmpty(),
  body("first_name").notEmpty(),
  body("last_name").notEmpty(),
  body("age").isInt({ min: 1 }),
  body("email").isEmail(),
  body("password").isLength({ min: 4 }),
// eslint-disable-next-line complexity
],async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const user = new User({
      username: req.body.username,
      first_name:req.body.first_name,
      last_name:req.body.last_name,
      age:req.body.age,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get a single user by ID
// eslint-disable-next-line complexity
router.get("/:id",auth, authorize("VIEW_USER_MODULE"),async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update a user by ID
// eslint-disable-next-line complexity
router.patch("/:id", auth,authorize("USER_MODULE_CRUDS"),async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const updates = Object.keys(req.body);
    const allowedUpdates = ["username", "email", "password","first_name","last_name","age"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    //updates.forEach((update) => (user[update] = req.body[update]));
    updates.forEach((update) => {
      if (update === "password") {
        user.password = bcrypt.hashSync(req.body[update], 10);
      } else {
        user[update] = req.body[update];
      }
    });
    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a user by ID
// eslint-disable-next-line complexity
router.delete("/:id",auth,authorize("USER_MODULE_CRUDS"), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


module.exports = router;
