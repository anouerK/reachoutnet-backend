var mongoose = require("mongoose");
// eslint-disable-next-line no-unused-vars
var userpermission = require("./userpermission");
var schema = mongoose.Schema;
mongoose.set("strictQuery", false);

var User = new schema({
  username: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  permissions: { type: Number, default: userpermission.NONE },
  creation_date: { type: Date,default: Date.now },
  last_login: { type: Date },
  is_verified:{type:Boolean},
  //active: { type: Date },
});
//db name in lowercase only
module.exports = mongoose.model("users", User);