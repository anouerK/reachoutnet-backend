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
        enum: ["User", "Association"]
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
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
            enum: ["User", "Association"]
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
            enum: ["User", "Association"]
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
                enum: ["User", "Association"]
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