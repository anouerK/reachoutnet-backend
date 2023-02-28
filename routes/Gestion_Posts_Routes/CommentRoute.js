/* eslint-disable complexity */

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


router.get("/:id", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const comment= await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404).send("Comment not found");
    } else {
      res.status(200).send(comment);
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
    const comment= await Comment.find();
    if (!comment) {
      res.status(404).send("Comments not found");
    } else {
      res.status(200).send(comment);
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
    const allowedupdates=["content","AttachedFilesComment"];
    const isValidOperation= updates.every((update)=>
      allowedupdates.includes(update)
    );
  
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }
      
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
  
    updates.forEach((update)=>
      comment[update]= req.body[update]
    );
    comment["ModificationDateComment"]= Date.now();
    comment["status"]="updated";
  
    await comment.save();
  
    res.status(200).send(comment);
  
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
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    
    res.status(200).send(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


module.exports = router;