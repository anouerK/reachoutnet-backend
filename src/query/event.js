const { GraphQLError } = require("graphql");
const { isValidObjectId } = require("mongoose");

const event_query = {
    events: async (_, __, { dataSources }) => {
        const events = await dataSources.eventAPI.getAllEvents();
        return events;
    },
    event: async (_, { id }, { dataSources }) => {
        if (!isValidObjectId(id)) { throw new GraphQLError("Invalid Object Id"); }
        const event = await dataSources.eventAPI.findOnebyId(id);

        return event;
    }
};

module.exports = event_query;
