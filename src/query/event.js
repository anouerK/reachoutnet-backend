const { GraphQLError } = require("graphql");
const { isValidObjectId } = require("mongoose");
const { isauthenticated } = require("../../middleware/userpermission");
const event_query = {
    events: async (_, __, { dataSources }) => {
        const events = await dataSources.eventAPI.getAllEvents();
        return events;
    },
    event: async (_, { id }, { dataSources }) => {
        if (!isValidObjectId(id)) { throw new GraphQLError("Invalid Object Id"); }
        const event = await dataSources.eventAPI.findOnebyId(id);

        return event;
    },
    checkRequest: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const userId = user.id;
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );
        if (existingRequestIndex !== -1) {
            console.log("true");
            return true;
        } else {
            console.log("false");
            return false;
        }
    }
};

module.exports = event_query;
