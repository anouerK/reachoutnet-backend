const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AuthLog = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    action: { type: String },
    userAgent: { type: String }
});

module.exports = mongoose.model("authlog", AuthLog);
