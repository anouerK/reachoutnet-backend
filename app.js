var express = require("express");
var compression = require("compression");
var mongoose = require("mongoose");
var path = require("path");
require("dotenv").config();



var cookieParser = require("cookie-parser");
var logger = require("morgan");


mongoose.connect(process.env.MONGO_URI);

var router = require("./routes/index");
var app = express();
app.use(compression({ level: 1 }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/", router);


module.exports = app;
