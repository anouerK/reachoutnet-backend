
const { makeExecutableSchema } = require("graphql-tools");
const {Chat}=require("../../models/gestion_chat/Typedef");
const resolvers=require("../../resolvers/Chatresolver");
module.exports= makeExecutableSchema({
  typeDefs:Chat,
  resolvers:resolvers
    
});

