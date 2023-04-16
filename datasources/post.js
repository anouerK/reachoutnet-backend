const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const Post = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "authorType"
    },
    authorType: {
        type: String,
        required: true,
        enum: ["users", "associations"]
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    likes: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "authorType"
        },
        authorType: {
            type: String,
            required: true,
            enum: ["users", "associations"]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "authorType"
        },
        authorType: {
            type: String,
            required: true,
            enum: ["users", "associations"]
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            author: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "authorType"
            },
            authorType: {
                type: String,
                required: true,
                enum: ["users", "associations"]
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("posts", Post);
