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
    eventassociation: async (_, { associationId }, { dataSources }) => {
        if (!isValidObjectId(associationId)) { throw new GraphQLError("Invalid Object Id"); }
        const event = await dataSources.eventAPI.getAllEventsbyassociation(associationId);

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
            if (event.requests[existingRequestIndex].state === 4) {
                return 4;
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
    },
    GetEventPart: async (_, { id }, { dataSources, req }) => {
        const usersInRequests = [];
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) {
            throw new Error(`Event with ID ${id} not found`);
        }
        for (const request of event.requests) {
            if (request.user && request.state === 2) {
                usersInRequests.push(request.user.toString());
            }
        }
        const users = await dataSources.userAPI.getAllUsers();
        const filteredUsers = users.filter(user => usersInRequests.includes(user.id.toString()));
        const skillss = [];
        const usersWithSkills = [];
        for (const user of filteredUsers) {
            const skillsId = user.skills.map(skill => skill.skill.toString());
            const skills = await dataSources.userAPI.getSkillById(skillsId);
            skillss.push(skills);
            usersWithSkills.push({
                user,
                skillss
            });
        }

        return usersWithSkills;
    },
    eventAvailbleSkills: async (_, { id }, { dataSources }) => {
        if (!isValidObjectId(id)) {
            throw new GraphQLError("Event  not found");
        }
        const event = await dataSources.eventAPI.findOnebyId(id);

        if (!event) {
            throw new GraphQLError("Event not found");
        }
        const available_skills = await dataSources.eventAPI.findAvailbleEventSkills(id);
        if (!available_skills) {
            throw new GraphQLError("No skills found");
        }
        return available_skills;
    },
    eventSkills: async (_, { id }, { dataSources }) => {
        if (!isValidObjectId(id)) {
            throw new GraphQLError("Event  not found");
        }
        const event = await dataSources.eventAPI.findOnebyId(id);

        if (!event) {
            throw new GraphQLError("Event not found");
        }
        const event_skills = await dataSources.eventAPI.findOneEventandPopulateSkills(id);
        if (!event_skills.skills) {
            throw new GraphQLError("No skills found");
        }
        return event_skills?.skills;
    }
};

module.exports = event_query;
