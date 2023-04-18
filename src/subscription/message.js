
const message_subscription = {

    messageSent: {

        subscribe: (_, __, { dataSources, req, pubsub }) => {
            console.log("New client subscribed to MESSAGE_CREATED"); // <-- add this line
            return pubsub.asyncIterator(["MESSAGE_CREATED"]);
        }
    }

};
module.exports = message_subscription;
