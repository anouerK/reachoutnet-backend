const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const Event = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    requests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        state: {
            type: Number,
            default: 0
        }
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    association: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "associations"
    },
    last_modified: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("event", Event);
