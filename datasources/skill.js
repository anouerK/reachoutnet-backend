const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Skill = new Schema({
    name: String,
    description: String,
    level: Number,
    last_modified: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("skill", Skill);
