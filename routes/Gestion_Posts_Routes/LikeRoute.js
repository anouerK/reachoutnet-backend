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


router.get("/:id", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const like= await Like.findById(req.params.id);
    if (!like) {
      res.status(404).send("Like not found");
    } else {
      res.status(200).send(like);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
    
    
router.get("/", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const like= await Like.find();
    if (!like) {
      res.status(404).send("Likes not found");
    } else {
      res.status(200).send(like);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.patch("/:id",async(req,res)=>{

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const updates = Object.keys(req.body);
    const allowedupdates=["reactionType"];
    const isValidOperation= updates.every((update)=>
      allowedupdates.includes(update)
    );
    
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }
        
    const like = await Like.findById(req.params.id);
    if (!like) {
      return res.status(404).send("Like not found");
    }
    
    updates.forEach((update)=>
      like[update]= req.body[update]
    );
 
    
    await like.save();
    
    res.status(200).send(like);
    
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
    const like = await Like.findByIdAndDelete(req.params.id);
    if (!like) {
      return res.status(404).send("Like not found");
    }
    
    res.status(200).send(like);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;



