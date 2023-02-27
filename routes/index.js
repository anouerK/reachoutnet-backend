var express = require("express");
var router = express.Router();



const user_router = require("./gestion_user/users");
const posts_router = require("./Gestion_Posts_Routes/PostRoute");
const comments_router=require("./Gestion_Posts_Routes/CommentRoute");
const likes_router=require("./Gestion_Posts_Routes/LikeRoute");


router.get("/", (req, res) => {
  res.send("welcome");
});



router.use("/users", user_router);
router.use("/post",posts_router);
router.use("/comment",comments_router);
router.use("/like",likes_router);


module.exports = router;
