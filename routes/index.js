var express = require("express");
var router = express.Router();


const user_router = require("./users");


router.get("/", (req, res) => {
  res.send("welcome");
});


router.use("/user", user_router);



module.exports = router;
