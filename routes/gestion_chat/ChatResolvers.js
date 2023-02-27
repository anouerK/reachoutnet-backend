const { ChatType } = require("../../models/gestion_chat/Typedef");
const { GraphQLList, GraphQLNonNull, GraphQLString ,GraphQLObjectType, GraphQLSchema } = require("graphql");
const Chat = require("../../models/gestion_chat/chat");


const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    chats: {
      type: GraphQLList(ChatType),
      resolve: async () => {
        const chats = await Chat.find();
        return chats;
      }
    }
  }
});

const RootMutationType=new GraphQLObjectType({
  name:"Mutation",
  fields:{
    addChat:{
      type:ChatType,
      args:{
        title:{type:GraphQLNonNull(GraphQLString)},
        participants:{ type: GraphQLList(GraphQLString) }
      },
      resolve: async(_,{title,participants})=>{
        const chat = new Chat({
          participants:participants,
          title:title
        });
        await chat.save();
        return chat;
      }
    }
        
  }
});

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

