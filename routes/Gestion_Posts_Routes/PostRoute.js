/* eslint-disable complexity */
const Post = require("../../models/Gestion_Posts/Post");
var express = require("express");
var router = express.Router();
const { body,validationResult } = require("express-validator");



router.post("/add",
  [
    body("authorPost").notEmpty(),
    body("authorTypePost").notEmpty(),
    body("content").notEmpty()
    // eslint-disable-next-line complexity
  ], async (req, res) =>{

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      var poste = new Post ( {
        authorPost: req.body.authorPost, // replace with a valid author ID
        authorTypePost: req.body.authorTypePost,
        content: req.body.content,
        AttachedFiles: req.body.AttachedFiles,
        tags: req.body.tags,
        ModificationDate: Date.now() 
      });

      await poste.save();
      res.status(201).send(poste);

    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }

  });


router.delete("/:id",async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).send("User not found");
    }
  
    res.status(200).send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


module.exports = router;