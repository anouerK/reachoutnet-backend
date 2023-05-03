const { GraphQLError } = require("graphql");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");
const { isauthenticated } = require("../../middleware/userpermission");
const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required().min(5),
    start_date: Joi.date().required(),
    end_date: Joi.date().required().greater(Joi.ref("start_date")),
    location: Joi.object({
        address: Joi.string().required(),
        x: Joi.number().optional(),
        y: Joi.number().optional()
    }).required(),
    eventImage: Joi.string().optional(),
    skills: Joi.array().items(Joi.custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid skill Id");
        }
        return value;
    }).optional()),
    attendees: Joi.array().items(Joi.custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid participants Id");
        }
        return value;
    }).required())
});
const addSkillSchema = Joi.object({
    id: Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid user Id");
        }
        return value;
    }).required(),
    skillToAdd: Joi.array().required().items(Joi.string().custom((value, helper) => {
        if (!isValidObjectId(value)) {
            return helper.message("Invalid skill Id");
        }
        return value;
    }))
});
const event_mutation = {
    createEvent: async (_, { name, description, start_date, end_date, location, attendees, eventImage, skills }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        if (!user) throw new GraphQLError("Event not authenticated");

        const { error, value } = schema.validate({ name, description, start_date, end_date, location, attendees, eventImage, skills });

        if (error) throw new GraphQLError(error.message);

        const newEvent = {
            ...value,
            created_by: user.id
        };
        const savedEvent = await dataSources.eventAPI.createEvent(newEvent);
        return savedEvent;
    },
    sendRequest: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const userId = user.id;
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex === -1) {
            // Add the user to the association
            event.requests.push({ user: userId, state: 1 });
        } else {
            throw new GraphQLError("User already exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    acceptRequest: async (_, { id, userId }, { dataSources, req }) => {
        await isauthenticated()(req);
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests[existingRequestIndex].state = 2;
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    refuseRequest: async (_, { id, userId }, { dataSources, req }) => {
        await isauthenticated()(req);
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests[existingRequestIndex].state = 3;
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },
    cancelRequest: async (_, { id }, { dataSources, req }) => {
        const user = await isauthenticated()(req);
        const userId = user.id;
        const event = await dataSources.eventAPI.findOnebyId(id);
        if (!event) throw new GraphQLError("Event not found");

        const existingRequestIndex = event.requests.findIndex(
            (request) => request.user.toString() === userId
        );

        if (existingRequestIndex !== -1) {
            // Add the user to the association
            event.requests.splice(existingRequestIndex, 1);
        } else {
            throw new GraphQLError("User dosen't exist");
        }

        const updated_event = await event.save();
        return updated_event;
    },

    addEventSkills: async (_, { id, skillToAdd }, { dataSources, req }) => {
        await isauthenticated()(req);
        const { error, value } = addSkillSchema.validate({ id, skillToAdd });
        if (error) return new GraphQLError(error.message);

        const event = await dataSources.eventAPI.findOneEventandPopulateSkills(id);

        if (!event) throw new GraphQLError("User not found");

        value.skillToAdd.forEach((skillToAdd) => {
            const existingSkill = event.skills.find((s) => {
                return s._id.toString() === skillToAdd.toString();
            });

            if (existingSkill) {
                throw new GraphQLError(`${existingSkill.skill.name} already exists`);
            }
            event.skills.push(skillToAdd);
        });

        const updated_event = await event.save();
        if (!updated_event) throw new GraphQLError("Failed to add skill");
        const returned_user = await dataSources.eventAPI.findOneEventandPopulateSkills(id);
        if (!returned_user) throw new GraphQLError("Failed to get user skill");
        return returned_user;
    }
};

module.exports = event_mutation;
