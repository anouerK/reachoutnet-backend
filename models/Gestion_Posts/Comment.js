var mongoose = require("mongoose");

var schema = mongoose.Schema;

var Comment= new schema({

  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  authorComment: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "authorType"
  },

  authorTypeComment: {
    type: String,
    required: true,
    enum: ["users"]
  },

  content: {
    type: String,
    required: true
  },

  AttachedFilesComment: [{
    url: {
      type: String,
    },
    caption: {
      type: String
    }
  }],

  status: {
    type: String,
    enum: ["approved", "pending", "spam", "deleted"],
    default: "pending"
  },

  CreationDateComment: {
    type: Date,
    default: Date.now
  },

  ModificationDateComment: {
    type: Date,
    required: false,
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],


});

module.exports = mongoose.model("Comment", Comment);