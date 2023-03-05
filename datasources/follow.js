const mongoose = require("mongoose");

// eslint-disable-next-line no-unused-vars

require("dotenv").config();

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const Follow = new Schema({

    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("follows", Follow);
