const mongoose = require("mongoose");

// eslint-disable-next-line no-unused-vars
const userpermission = require("../middleware/userpermission");
require("dotenv").config();

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const User = new Schema({
    username: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: { type: Number, default: userpermission.NONE },
    creation_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    is_verified: { type: Boolean }
    // active: { type: Date },
});
// db name in lowercase only
module.exports = mongoose.model("users", User);
