var express = require("express");
var router = express.Router();


const user_router = require("./gestion_user/users");


router.get("/", (req, res) => {
  res.send("welcome");
});



router.use("/users", user_router);



module.exports = router;
