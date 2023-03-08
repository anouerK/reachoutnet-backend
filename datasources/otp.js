const mongoose = require("mongoose");

const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const Otp = new Schema({
    userId: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    last_modified: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    base32: { type: String }
});

module.exports = mongoose.model("otp", Otp);
