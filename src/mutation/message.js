const message_mutation = {
    createMessage: async (_, { msg }, { dataSources, req, pubsub }) => {
        const Message = dataSources.messageAPI;
        // const user = await isauthenticated()(req);
        const saved_message = await Message.createMessage(msg);
        pubsub.publish("MESSAGE_CREATED", {
            messageSent: saved_message,
            receiverId: saved_message.receiverId,
            receiverType: saved_message.receiverType
        });
        return saved_message;
    }

};
module.exports = message_mutation;
