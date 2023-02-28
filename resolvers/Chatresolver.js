const { ChatType } = require("../models/gestion_chat/Typedef");
const { GraphQLList, GraphQLNonNull, GraphQLString} = require("graphql");
const Chat = require("../models/gestion_chat/chat");

const resolvers_chat = {
  Query: {
    chats: {
      type: GraphQLList(ChatType),
      resolve: async () => {
        const chats = await Chat.find();
        return chats;
      }
    },
  },
  Mutation: {
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
  },
};

module.exports =  resolvers_chat ;
