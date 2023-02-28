var mongoose = require("mongoose");

var schema = mongoose.Schema;

var Post = new schema({

  authorPost: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "authorType"
  },

  authorTypePost: {
    type: String,
    required: true,
    enum: ["users"]
  },

  content: {
    type: String,
    required: true
  },

  AttachedFiles: [{
    url: {
      type: String,
    },
    caption: {
      type: String
    },
    thumbnail: {
      type: String
    }
  }],

  CreationDate: {
    type: Date,
    default: Date.now
  },

  ModificationDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["published", "draft", "updated", "deleted"],
    default: "draft"
  },
  tags:{
    type: [String]
  }
});

module.exports = mongoose.model("Post", Post);