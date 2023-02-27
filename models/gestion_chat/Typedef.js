
const { GraphQLNonNull } = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLList } = require("graphql");


const ChatType = new GraphQLObjectType({
  name: "chat",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    title:{type:GraphQLNonNull(GraphQLString)},
    participants: { type: GraphQLList(GraphQLString) }
  })
});


const MessageType = new GraphQLObjectType({
  name: "message",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    chat_id: { type: GraphQLNonNull(GraphQLString) },
    sender_id: { type: GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLNonNull(GraphQLString) },
    created_at: { type: GraphQLNonNull(GraphQLString) }
  })
}); 

module.exports = {
  ChatType,
  MessageType
};