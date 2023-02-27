var mongoose = require("mongoose");

var schema = mongoose.Schema;

var Like= new schema({

    
  ReactedOn: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "Reaction"
  },
 
  Reaction: {
    type: String,
    required: true,
    enum: ["Post","Comment","ReplyComment"]
  },

  authorLike: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "authorType"
  },

  authorType: {
    type: String,
    required: true,
    enum: ["users"]
  },

  CreationDateLike: {
    type: Date,
    default: Date.now
  },
 
  reactionType: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // reaction type: 1:like , 2:love , 3:wow , 4:sad , 5:angry .
    required: true
  },

});

module.exports = mongoose.model("Like", Like);