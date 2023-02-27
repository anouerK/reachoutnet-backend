
const Comment = require("../../models/Gestion_Posts/Comment");
var express = require("express");
var router = express.Router();
const { body,validationResult } = require("express-validator");



router.post("/add",
  [
    body("authorPost").notEmpty(),
    body("authorTypePost").notEmpty(),
    body("content").notEmpty(),
    body("AttachedFiles").notEmpty(),
    body("tags").notEmpty()
    // eslint-disable-next-line complexity
  ], async (req, res) =>{

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      var comment = new Comment ( {
        authorPost: req.body.authorPost, // replace with a valid author ID
        authorTypePost: req.body.authorTypePost,
        content: req.body.content,
        AttachedFiles: req.body.AttachedFiles,
        tags: req.body.tags,
        ModificationDate: Date.now() 
      });

      await comment.save();
      res.status(201).send(comment);

    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }

  });

module.exports = router;