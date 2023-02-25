var mongoose = require("mongoose");

var schema = mongoose.Schema;

var User = new schema({
  name: String,
  age: Number
});
//db name in lowercase only
module.exports = mongoose.model("users", User);