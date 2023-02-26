var express = require("express");
var compression = require("compression");
var mongoose = require("mongoose");
var path = require("path");
require("dotenv").config();
var usersRouter = require("./routes/users");


var cookieParser = require("cookie-parser");
var logger = require("morgan");


//mongoose.connect(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected!");
    app.listen(27017, () => console.log(`Server running on port ${27017}`));
  })
  .catch(err => console.log(err));

var router = require("./routes/index");
var app = express();
app.use(compression({ level: 1 }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/", router);
app.use("/users", usersRouter);


module.exports = app;
