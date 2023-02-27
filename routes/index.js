/* eslint-disable complexity */
var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/gestion_user/user");
const user_router = require("./gestion_user/users");
const posts_router = require("./Gestion_Posts_Routes/PostRoute");
const comments_router = require("./Gestion_Posts_Routes/CommentRoute");
const likes_router = require("./Gestion_Posts_Routes/LikeRoute");


const attachUserToReq = async (req, res, next) => {
  
  const token_before_replace = req.header("Authorization");
  if(token_before_replace!=null)
  {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedToken;
      const user = await User.findOne({ _id: decodedToken.userId });
      if (user) 
        req.user = user;
      else
        req.user=null;
    }
  }
  
  next();
};
router.use(attachUserToReq);
router.get("/", (req, res) => {
  res.send("welcome");
});



router.use("/users", user_router);
router.use("/post",posts_router);
router.use("/comment",comments_router);
router.use("/like",likes_router);


module.exports = router;
