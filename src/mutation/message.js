// const { GraphQLError } = require("graphql");
// const { isauthenticated } = require("../../middleware/userpermission");

const message_mutation = {
    createMessage: async (_, { msg }, { dataSources, req, wsServer }) => {
        const Message = dataSources.messageAPI;
        // const user = await isauthenticated()(req);
        const saved_message = await Message.createMessage(msg);
        console.log(wsServer);
        wsServer.publish("MESSAGE_SENT", {
            messageSent: saved_message,
            receiverId: saved_message.receiverId,
            receiverType: saved_message.receiverType
        });
        return saved_message;
    }

};
module.exports = message_mutation;
