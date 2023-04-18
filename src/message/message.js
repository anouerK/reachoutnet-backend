
const message_message = {

    sender: async (parent, __, { dataSources, req }) => {
        if (parent.senderType === "USER") {
            return await dataSources.userAPI.findById(parent.senderId);
        } else {
            return await dataSources.associationAPI.findById(parent.senderId);
        }
    },
    receiver: async (parent, __, { dataSources, req }) => {
        if (parent.receiverType === "USER") {
            return await dataSources.userAPI.findById(parent.receiverId);
        } else {
            return await dataSources.associationAPI.findById(parent.receiverId);
        }
    }

};

module.exports = message_message;
