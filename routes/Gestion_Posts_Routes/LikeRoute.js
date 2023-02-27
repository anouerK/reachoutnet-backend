/* eslint-disable complexity */
const Like = require("../../models/Gestion_Posts/Like");
var express = require("express");
var router = express.Router();
const { body,validationResult } = require("express-validator");

router.post("/add",
  [
    body("reactedOn").notEmpty(),
    body("reactedOnType").notEmpty(),
    body("authorLike").notEmpty(),
    body("authorLikeType").notEmpty(),
    body("reactionType").notEmpty()
  ], async (req, res)=> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      var like= new Like({
        reactedOn:req.body.reactedOn,
        reactedOnType:req.body.reactedOnType,
        authorLike:req.body.authorLike,
        authorLikeType:req.body.authorLikeType,
        reactionType:req.body.reactionType
      });

      await like.save(like);
      res.status(201).send(like);

    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }

  });


module.exports = router;



