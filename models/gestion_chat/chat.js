const mongoose = require("mongoose");


const ChatSchema = new mongoose.Schema(
  {
    title:{type:String},
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    created_at: { type: Date, default: Date.now }
  }
);

module.exports = mongoose.model("chat", ChatSchema);

