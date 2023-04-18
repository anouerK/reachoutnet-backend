/* eslint-disable no-unused-vars */
const { isauthenticated, userpermission, authorize } = require("../../middleware/userpermission");
const { GraphQLError } = require("graphql");
const message_query = {
    messages: async (_, { id1, id2 }, { dataSources, req }) => {
        // const user = isauthenticated();

        const messages = await dataSources.messageAPI.findMessages(id1, id2, "users", "users");
        console.log(messages);
        return messages;
    }
};

module.exports = message_query;
