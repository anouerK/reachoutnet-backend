const pubsub = require("../utils/sub");
const message_mutation = {
    createMessage: async (_, { msg }, { dataSources, req }) => {
        const Message = dataSources.messageAPI;
        // const user = await isauthenticated()(req);
        const saved_message = await Message.createMessage(msg);
        pubsub.publish("POST_CREATED", { messageSent: saved_message });
        return saved_message;
    }

};
module.exports = message_mutation;
