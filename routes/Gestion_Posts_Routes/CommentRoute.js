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

router.post("/addReplyComment/:commentId", // add comment 
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
  
      var ParentComment = await Comment.findById(req.params.commentId);

      if(!ParentComment)
      {res.status(404).send("Parent Comment not found");}
      else
      {

        var comment = new Comment ( {
          postId: req.body.postId, // replace with a valid author ID
          authorComment: req.body.authorComment,
          authorTypeComment: req.body.authorTypeComment,
          parentComment:req.params.commentId,
          content: req.body.content,
          AttachedFilesComment: req.body.AttachedFilesComment,
        });

        await comment.save();
    
        ParentComment["replies"].push( comment["_id"]);
        await ParentComment.save();
        
        res.status(201).send(comment);
      }
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

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    //delete all replies related with this parent comment 

    if(comment["replies"].length > 0) /// check if replies  field is not empty 
    {
      var comments = await Comment.find(); // return all comments 

      Comment.findById(comment["_id"]).populate("replies").exec((err, comment) => { // The populate() method is used to populate the replies field of the comment object with the actual reply comment objects instead of just their IDs. This is achieved by passing the string "replies" as an argument to the populate() method. The exec() method is used to execute the query and fetch the comment object.
       
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }

        comments.forEach((c) => { // loop comments

          var parentCommentId = c["_id"].toString(); // the id of each comment.
          const repliesIds = comment.replies.map(reply => reply._id.toString()); 
          repliesIds.forEach(async (rep)=> {     // loop  replies      
            if(parentCommentId === rep) /// if the commentReply exists in the replies array
              await Comment.findByIdAndDelete(parentCommentId);    // delete reply 
          }); // end foreach repliesId 
        }); // end foreach comments
      });
    }
  
    // remove relation between the deleted commnt and the parent comment 

    if(comment["parentComment"]!=null){  // check  if the comment is a reply 

      const parentComment = await Comment.findOneAndUpdate( // delete relation betwen reply and parent comment
        {_id:comment["parentComment"]},
        {$pull:{replies : comment["_id"] }},
        {new:true}
      );
      await parentComment.save();

    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).send(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }

});


module.exports = router;