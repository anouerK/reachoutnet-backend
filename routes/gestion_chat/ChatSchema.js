
const { makeExecutableSchema } = require("graphql-tools");
const {Chat}=require("../../models/gestion_chat/Typedef");
const resolvers=require("../../resolvers/Chat.resolver");
module.exports= makeExecutableSchema({
  typeDefs:Chat,
  resolvers:resolvers
    
});

