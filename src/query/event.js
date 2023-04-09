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
            if (event.requests[existingRequestIndex].state === 1) {
                return 1;
            }
            if (event.requests[existingRequestIndex].state === 2) {
                return 2;
            }
            if (event.requests[existingRequestIndex].state === 3) {
                return 3;
            }
        } else {
            return 0;
        }
    },
    GetRequests: async (_, { id }, { dataSources, req }) => {
        const usersInRequests = [];
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) {
            throw new Error(`Event with ID ${id} not found`);
        }
        for (const request of event.requests) {
            if (request.user && request.state === 1) {
                usersInRequests.push(request.user.toString());
            }
        }
        const users = await dataSources.userAPI.getAllUsers();
        const filteredUsers = users.filter(user => usersInRequests.includes(user.id.toString()));
        return filteredUsers;
    }
};

module.exports = event_query;
