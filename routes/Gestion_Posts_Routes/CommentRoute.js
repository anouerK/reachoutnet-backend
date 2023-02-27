
const Comment = require("../../models/Gestion_Posts/Comment");
var express = require("express");
var router = express.Router();
const { body,validationResult } = require("express-validator");



router.post("/add", // add comment 
  [
    body("postId").notEmpty(),
    body("authorComment").notEmpty(),
    body("authorTypeComment").notEmpty(),
    body("content").notEmpty(),
    body("AttachedFilesComment").notEmpty()
    // eslint-disable-next-line complexity
  ], async (req, res) =>{

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      var comment = new Comment ( {
        postId: req.body.postId, // replace with a valid author ID
        authorComment: req.body.authorComment,
        authorTypeComment: req.body.authorTypeComment,
        content: req.body.content,
        AttachedFilesComment: req.body.AttachedFilesComment,
      });

      await comment.save();
      res.status(201).send(comment);

    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }

  });

module.exports = router;