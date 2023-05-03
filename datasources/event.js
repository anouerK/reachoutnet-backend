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
        address: {
            type: String,
            required: true
        },
        x: {
            type: Number,
            required: false
        },
        y: {
            type: Number,
            required: false
        }
    },
    eventImage: {
        type: String,
        required: false,
        allowNull: true
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
            type: Number
        }
    }],
    skills: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "skill"
        }
    ],
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
