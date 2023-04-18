const message_subscription = {

    messageSent: {
        subscribe: (_, { receiverId, receiverType }, { dataSources, req, pubsub }) => {
            return pubsub.asyncIterator("MESSAGE_SENT");
        },
        resolve: (payload) => {
            // Filter messages based on subscription arguments
            const { messageSent, receiverId, receiverType } = payload;
            if (
                messageSent.receiverId.toString() === receiverId &&
              messageSent.receiverType === receiverType
            ) {
                return messageSent;
            }
            return null;
        }
    }

};
module.exports = message_subscription;
