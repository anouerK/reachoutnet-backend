/* eslint-disable prefer-const */

const pubsub = require("../utils/sub");
const UserAPI = require("../../datasources/UserApi");
// const AssociationApi = require("../../datasources/AssociationApi");
const message_subscription = {
    messageSent: {
        subscribe: (_, __) => pubsub.asyncIterator("POST_CREATED"),
        resolve: async (payload) => {
            const User = new UserAPI();
            let sender = await User.findOnebyId(payload.messageSent.sender);
            let receiver = await User.findOnebyId(payload.messageSent.receiver);
            const user = {
                user: sender
            };
            const user1 = {
                user: receiver
            };
            const Message = {
                sender: user,
                senderType: payload.messageSent.senderType,
                receiver: user1,
                receiverType: payload.messageSent.receiverType,
                content: payload.messageSent.content,
                createdAt: payload.messageSent.createdAt,
                _id: payload.messageSent._id
            };
            return Message;
        }
    }

};
module.exports = message_subscription;
