const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Message = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "senderType"
    },
    senderType: {
        type: String,
        required: true,
        enum: ["users", "associations"]
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "receiverType"
    },
    receiverType: {
        type: String,
        required: true,
        enum: ["users", "associations"]
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("message", Message);
