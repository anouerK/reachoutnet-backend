var express = require("express");
var compression = require("compression");
var path = require("path");

var cookieParser = require("cookie-parser");
var logger = require("morgan");

var router = require("./routes/index");
var app = express();
app.use(compression({ level: 1 }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//router
app.use("/", router);


module.exports = app;
