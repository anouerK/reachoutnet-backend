const mongoose = require("mongoose");

require("dotenv").config();

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const Follow = new Schema({

    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "followerType"
    },

    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "followingType"
    },

    followerType: {
        type: String,
        required: true,
        enum: ["users", ""]
    },

    followingType: {
        type: String,
        required: true,
        enum: ["users", "associations"]
    },

    createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("follows", Follow);
