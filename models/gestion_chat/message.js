const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chat_id: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  sender_id: { type: mongoose.Schema.Types.ObjectId, },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("message",MessageSchema);


