
const message_message = {

    sender: async (parent, __, { dataSources, req }) => {
        console.log(parent.sender._id);
        if (parent.senderType === "users") {
            return await dataSources.userAPI.findOnebyId(parent.sender._id);
        } else {
            return await dataSources.associationAPI.findById(parent.sender._id);
        }
    },
    receiver: async (parent, __, { dataSources, req }) => {
        if (parent.receiverType === "users") {
            return await dataSources.userAPI.findOnebyId(parent.receiver._id);
        } else {
            return await dataSources.associationAPI.findById(parent.receiver._id);
        }
    }

};

module.exports = message_message;
