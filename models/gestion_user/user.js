var mongoose = require("mongoose");

var schema = mongoose.Schema;
mongoose.set("strictQuery", false);

var User = new schema({
  username: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "staff","admin"], default: "user" },
  creation_date: { type: Date,default: Date.now },
  last_login: { type: Date },
  //active: { type: Date },
});
//db name in lowercase only
module.exports = mongoose.model("users", User);