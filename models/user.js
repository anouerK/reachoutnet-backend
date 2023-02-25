var mongoose = require("mongoose");

var schema = mongoose.Schema;
mongoose.set("strictQuery", false);

var User = new schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});
//db name in lowercase only
module.exports = mongoose.model("users", User);