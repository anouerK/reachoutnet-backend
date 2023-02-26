var express = require("express");
var router = express.Router();
var User = require("../models/gestion_user/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { graphqlHTTP } = require("express-graphql");
var schema = require("../models/gestion_user/schema");



router.use("/graphql", graphqlHTTP({
  schema: schema,
  graphiql: true, // Set this to false if you don't want to use the GraphiQL web interface
}));
router.get("/", async (req, res)=> {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/add", async (req, res) => {
  try {
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
router.get("/:id", async (req, res) => {
  try {
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
router.patch("/:id", async (req, res) => {
  try {
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

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete a user by ID
// eslint-disable-next-line complexity
router.delete("/:id", async (req, res) => {
  try {
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
