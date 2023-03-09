const mongoose = require("mongoose");

// eslint-disable-next-line no-unused-vars
const userpermission = require("../middleware/userpermission");
require("dotenv").config();

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const Interest = new Schema({
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    nameInterest: { type: String, required: true },
    description: { type: String, required: true }
});
module.exports = mongoose.model("interests", Interest);
