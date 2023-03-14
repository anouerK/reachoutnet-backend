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
    birthdate: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    permissions: { type: Number, default: 0 },
    creation_date: { type: Date, default: Date.now },
    last_login: { type: Date },
    is_verified: { type: Boolean, default: 0 },
    banned: { type: Boolean, default: 0 },
    has_otp: { type: Boolean, default: false },
    skills: [{
        skill: { type: mongoose.Schema.Types.ObjectId, ref: "skill", required: true },
        level: { type: Number, required: true, default: 0 },
        verified: { type: Boolean, required: true, default: false },
        last_modified: { type: Date, default: Date.now }
    }],
    activationCode: { type: String },
    default: { skills: [] }
    // active: { type: Date },
});
// db name in lowercase only
module.exports = mongoose.model("users", User);
