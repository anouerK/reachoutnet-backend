var mongoose = require("mongoose");

var schema = mongoose.Schema;

var Comment= new schema({

});

module.exports = mongoose.model("comment", Comment);